# NAGISA.EXE 个人主页

Cyberpunk 2077 风格的个人主页。同一份源码构建出两个版本：

| 版本 | 输出目录 | 内容 | 发布到 |
| --- | --- | --- | --- |
| 公开版 | `dist/public` | 只含可公开信息 | GitHub Pages |
| 内网版（完整版） | `dist/internal` | 公开 + 内网信息 | POPO |

## 填内容的规则：先判断是公开还是内网

每填一条内容，先问自己“这条能不能让陌生人看到”。

| 类型 | 配置写在 | 素材放在 |
| --- | --- | --- |
| 可公开 | `src/content/profile.mjs`（入库） | `src/assets/`（入库） |
| 内网 / 私密 | `src/content/profile.private.mjs`（被 `.gitignore` 屏蔽） | `src/assets.private/`（被 `.gitignore` 屏蔽） |

内网版构建时，`profile.private.mjs` 会叠加到 `profile.mjs` 上：

- 普通对象：逐字段递归合并，内网值优先。
- 带 `id` 的数组（链接分组、链接、日志条目、按钮）：`id` 相同就合并覆盖，`id` 新增就追加。
- 其他数组（标签、身份卡 rows、打字机词条等）：整体替换。
- 一个字段无法同时满足公开和内网时，两个文件各写一份即可，例如公开版 `tagline` 不写公司信息，内网版再覆盖成完整的。

## 命令

```bash
npm run dev            # 预览内网版 http://127.0.0.1:8765，保存 src/ 后自动重建
npm run dev:public     # 预览公开版
npm run build          # 同时构建两个版本到 dist/
npm run build:public   # 只构建公开版（含泄露扫描）
npm run build:internal # 只构建内网版
npm run check          # 提交前检查（扫描将被提交的文件）
npm run setup          # 启用 pre-commit 钩子（克隆后执行一次）
```

要求 Node 18+，没有 npm 依赖。

## 配图与访问统计

- `about.entries[].art`：放在对应日志右侧的配图，支持一个图片对象或图片对象数组，未填写时自动恢复纯文字布局。
- `contact.okImage`：联络终端的配图，公开版与内网版可以分别指定。

图片对象统一写成 `{ src: "assets/图片名", alt: "屏幕阅读器使用的说明" }`。新增公开图片放进 `src/assets/`，私密图片放进 `src/assets.private/`；无需改渲染模板。

两版的 `community.telemetry` 使用同一个统计服务，展示实时累计 PV、UV、最近 7 天 WAU，趋势面板可展开查看最近 10 天的数据。原知识库的浏览、知识币、已读、点赞、投票和签到快照不进入新页面，精选评论仍单独保留。

- 内网版 `userMode: "popo"` 通过 `window.PopSDK.user.info()` 获取用户名、昵称和头像，沿用原文档的统计记录，不读取部门、正文或评论。
- 公开版 `userMode: "fingerprint"` 使用完全独立的 `nagisa-profile-public` 统计标识，不包含原文档标识。用户代理、语言、屏幕、时区等浏览器特征与统计标识一起在本机计算 SHA-256，只发送截短后的不可逆哈希，不发送原始特征。
- 公开配置中的 `service` 会随页面公开，隐私扫描仅放行这一处明确配置的统计服务，其他私有域名仍照常拦截。
- 本地预览使用非默认端口，只读取汇总，不产生访问记录。首次有人访问前，公开版如实显示 0。

## 隐私保护（多层）

1. `.gitignore` 屏蔽 `profile.private.mjs`、`assets.private/`、`dist/`、`raw/`。
2. `build:public` 对公开版产物做泄露扫描：内网域名、公司账号、如流协议、私有服务域名、疑似密钥，以及按内容哈希比对 `assets.private/` 里的素材。命中就构建失败。
3. `npm run check` 扫描将被提交的文件（已跟踪 + 未忽略的新文件），发现私密文件或敏感词就失败。
4. `.githooks/pre-commit` 在提交前自动执行 2、3 两项（先运行 `npm run setup` 启用）。
5. GitHub Actions 部署前同样执行 check 和公开版构建。CI 环境里没有私密文件，只能构建公开版。

## 发布

- **GitHub Pages**：仓库 Settings → Pages → Source 选 GitHub Actions，推送到 `main` 后自动部署 `dist/public`。
- **POPO**：执行 `npm run build:internal`，把 `dist/internal` 作为发布目录，入口 `index.html`。

## 目录

```
src/
  content/profile.mjs          公开内容
  content/profile.private.mjs  内网内容（本地，不入库）
  assets/ assets.private/      公开 / 私密素材
  styles/ scripts/ templates/  样式、前端脚本、页面外壳
scripts/
  build.mjs  dev.mjs  check.mjs
  lib/       渲染、合并、泄露扫描
.githooks/ .github/workflows/  提交钩子与 CI
dist/        构建产物（不入库）
```

## 备份提醒

私密文件只存在本机，没有远程副本。换电脑或重装前请自行备份 `src/content/profile.private.mjs` 和 `src/assets.private/`。
