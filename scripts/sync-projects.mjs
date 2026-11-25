/**
 * 从 GitHub 拉取白名单仓库的实时数据，生成页面要用的静态数据文件。
 * 用法：
 *   node scripts/sync-projects.mjs           # 写入 src/data/projects.json 与 feed.json
 *   node scripts/sync-projects.mjs --check   # 只报告会有什么变化，不落盘
 *
 * 环境变量：GITHUB_TOKEN（本地可用 `gh auth token` 取，Actions 里用 secrets.GITHUB_TOKEN）
 * 设计原则：白名单决定"展示什么"，GitHub 只提供"数字是多少"，两者永不互相污染。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../src/content/projects.config.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data');
const checkOnly = process.argv.includes('--check');

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': 'nagisa-profile-sync',
  ...(token ? { authorization: `Bearer ${token}` } : {}),
};

/** 统一请求，遇到 404 返回 null（仓库不存在或已私有），其他错误直接抛出 */
async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status} ${await res.text().catch(() => '')}`);
  return res.json();
}

const day = (iso) => (iso ? iso.slice(0, 10) : '');

/** 拉单个仓库的展示数据 */
async function fetchRepo(item) {
  const repo = await api(`/repos/${config.owner}/${item.repo}`);
  if (!repo) {
    console.warn(`! 跳过 ${item.repo}：仓库不存在或不可见`);
    return null;
  }
  return {
    repo: repo.name,
    desc: item.desc,
    live: item.live || '',
    stars: repo.stargazers_count,
    language: repo.language || '',
    updated: day(repo.pushed_at),
    archived: repo.archived,
    url: repo.html_url,
  };
}

/** 拉最近 release，作为动态流的一部分 */
async function fetchReleases(repoName) {
  const list = await api(`/repos/${config.owner}/${repoName}/releases?per_page=3`);
  return (list || []).map((r) => ({
    repo: repoName,
    tag: r.tag_name,
    name: (r.name || r.tag_name || '').trim().slice(0, 80),
    url: r.html_url,
    at: day(r.published_at),
  }));
}

async function main() {
  const groups = [];
  const flat = [];

  for (const group of config.groups) {
    const items = [];
    for (const item of group.items) {
      const data = await fetchRepo(item);
      if (data) {
        items.push(data);
        flat.push({ ...data, category: group.label });
      }
    }
    if (items.length) groups.push({ label: group.label, items });
  }

  const releases = [];
  // 只取最近更新的几个仓库的 release，避免请求过多
  for (const repo of [...flat].sort((a, b) => (a.updated < b.updated ? 1 : -1)).slice(0, 10)) {
    releases.push(...(await fetchReleases(repo.repo)));
  }

  // 不写入生成时间：同一份仓库数据必须产生同一份文件，定时任务才不会每次都有 diff
  const projects = { owner: config.owner, groups };
  const feed = {
    updated: [...flat].sort((a, b) => (a.updated < b.updated ? 1 : -1)).slice(0, 10)
      .map(({ repo, desc, updated, url, language, stars }) => ({ repo, desc, at: updated, url, language, stars })),
    releases: releases.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8),
  };

  const total = flat.reduce((n, r) => n + r.stars, 0);
  console.log(`同步完成：${flat.length} 个仓库，合计 ${total} star，${feed.releases.length} 条 release`);

  if (checkOnly) {
    console.log('--check 模式，未写入文件');
    return;
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(join(dataDir, 'projects.json'), JSON.stringify(projects, null, 2) + '\n');
  await writeFile(join(dataDir, 'feed.json'), JSON.stringify(feed, null, 2) + '\n');
  console.log('已写入 src/data/projects.json 与 src/data/feed.json');
}

/** 没有 token 或接口失败时退回上一份本地数据，避免本地构建被限流卡住 */
main().catch(async (err) => {
  const hasLocal = await readFile(join(dataDir, 'projects.json'), 'utf8').then(() => true).catch(() => false);
  if (hasLocal) {
    console.warn(`! 同步失败（${err.message}），保留上一份数据继续`);
    process.exit(0);
  }
  console.error(`✗ 同步失败且没有历史数据：${err.message}`);
  process.exit(1);
});
