/**
 * 【开源档案白名单】决定 profile 页面展示哪些仓库、怎么归类、写什么中文简介。
 * 只有列在这里的仓库才会被 sync-projects.mjs 取数；star / 语言 / 更新时间全部来自 GitHub API。
 *
 * 新增一个仓库：在对应分类里加一行 { repo, desc, live? }；
 * 不想再展示：把这一行删掉即可（不要用注释保留，避免"看起来还在"）。
 * live 填该仓库对应的线上地址（例如挂到 8o.nz 子域的站点）。
 */
export default {
  owner: "nagisa-win",
  /** 生成数据里的标识，用于页面与前端缓存 */
  id: "nagisa-public-repos",
  groups: [
    {
      label: "AGENT 工具",
      items: [
        { repo: "skkill", desc: "给所有 agent 用的技能管理器，拿 package.json 当版本控制", live: "https://skills.8o.nz/" },
        { repo: "agent-relay", desc: "自托管的中转站：不同人的 agent 之间交换请求，由接收方本人审核" },
        { repo: "fanzha-skill", desc: "反诈技能包：给 agent 的防骗知识库与判断流程" },
      ],
    },
    {
      label: "WEB 与工具",
      items: [
        { repo: "mermaid-render", desc: "Mermaid 代码即时出图，支持导出 PNG / JPG", live: "https://mermaid.8o.nz/" },
        { repo: "advanced-js-calculator", desc: "用 Jison 写的表达式计算器，解析过程可视化", live: "https://calc.8o.nz/" },
        { repo: "web-router", desc: "一个很小的客户端路由，零依赖" },
        { repo: "cli-tools", desc: "留下来的命令行脚本集合，bash 与 Python" },
        { repo: "NB-Rename", desc: "跨平台批量重命名，类似 PowerToys 的 PowerRename" },
        { repo: "algo-ts", desc: "用 TypeScript 写算法题，带测试脚手架" },
      ],
    },
    {
      label: "端侧",
      items: [
        { repo: "gold-board", desc: "macOS 桌面浮窗：金价走势、唤醒定时器、触控板震动提醒" },
        { repo: "mobile-photo-cleanup-kit", desc: "Web 优先的安卓照片去重与缩略图清理，走 ADB" },
        { repo: "better-coloros", desc: "ColorOS 的 LSPosed 插件合集：缺什么功能自己写" },
        { repo: "oppo-camera-normalization", desc: "把 OPPO 相机的输出文件名规范化" },
      ],
    },
    {
      label: "输入与主题",
      items: [
        { repo: "Rime-Pro-Dict", desc: "自动生成 Rime 输入法的专业词库" },
        { repo: "dsh-animal-island-theme", desc: "DeepSeek Harness 的动物岛风格主题" },
        { repo: "userscript.js", desc: "原创或改造过的浏览器用户脚本" },
      ],
    },
    {
      label: "基础设施",
      items: [
        { repo: "webhook", desc: "自用的 webhook 接收与转发服务" },
        { repo: "node-proxy", desc: "一个轻量代理，用来处理跨域与转发" },
        { repo: "openclaw-uninstaller", desc: "把 OpenClaw 从系统里彻底卸干净" },
      ],
    },
  ],
};
