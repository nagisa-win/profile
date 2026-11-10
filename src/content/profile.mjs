/**
 * 【公开版内容】会被提交到 Git，并发布到 GitHub Pages。
 * 这里只能放可以对外公开的信息。
 *
 * 每填一条内容前先判断它属于哪一类：
 *   - 可公开：放在本文件（profile.mjs）、素材放 src/assets/
 *   - 内网 / 私密：放在 profile.private.mjs（已被 .gitignore 屏蔽）、素材放 src/assets.private/
 * 内网版构建时会把 private 文件叠加到本文件上，输出到 dist/internal。
 *
 * 写法规则：
 *   - 文字里的 **加粗** 渲染为高亮；其余 HTML 字符一律转义。
 *   - 想隐藏某个版块，不写该字段即可，导航和锚点会自动同步。
 *   - 数组里的条目带 id，是为了让 private 文件能按 id 覆盖或追加。
 */
export default {
  meta: {
    title: "渚 // NAGISA.EXE — 个人说明书",
    description: "渚的个人说明书：100°C 魔法 FE，前端魔法少女，摩托车手。",
    favicon: "assets/avatar.webp",
    brand: ["NAGISA", "//", "2077"],
  },

  hero: {
    eyebrow: "// NIGHT CITY · CLASS OF 2023",
    name: "NAGISA",
    subtitle: "渚的个人说明书",
    tagline: "可以叫我 **小渚 / 渚酱 / 渚**。100°C 魔法 AI 鼓励师",
    typed: ["> 100°C 魔法 FE", "> 前端魔法少女", "> 全栈魔法少女", "> 大模型鼓励师", "> AnyScript 填坑大师", "> 社恐，但是赛博社牛", "> 两轮承载灵魂"],
    buttons: [{ id: "jack", text: "JACK IN →", href: "#net" }],
  },

  idcard: {
    status: "● ONLINE",
    avatar: "assets/avatar.webp",
    avatarAlt: "头像",
    rows: [
      ["HANDLE", "渚 / NAGISA", true],
      ["CLASS", "Netrunner · FE"],
      ["ORIGIN", "PZH"],
      ["OS", "INFJ · 处女座"],
      ["BOOT", "Sep. 2000"],
      ["座驾", "春风、升仕、九号"],
    ],
  },

  links: {
    title: "Data Shards",
    sub: "公开链接 · 可以直接访问",
    groups: [
      {
        id: "open",
        label: "[ 公开 / OPEN ]",
        items: [
          { id: "blog", kind: "BLOG · 个人部落格", title: "RyzenX.com", desc: "ryzenx.com", url: "https://ryzenx.com" },
          { id: "github", kind: "CODE · 开源", title: "GitHub", desc: "nagisa-win", url: "https://github.com/nagisa-win" },
        ],
      },
    ],
  },

  stats: {
    title: "Attributes",
    sub: "职业 & 性格 · 角色属性面板",
    left: {
      title: "CLASS PERKS · 职业标签",
      tags: ["100°C 魔法AI鼓励师", "前端魔法少女", "AnyScript 填坑大师"],
      meters: [["AI.HARNESS", "LV.MAX", 90], ["ANYSCRIPT", "∞", 100], ["BUG.REPELLENT", "不稳定", 62]],
    },
    right: {
      title: "PERSONALITY CHIP · 性格标签",
      tags: ["处女座", "INFJ", "社恐人", "轻微强迫症"],
      redacted: ["REDACTED████"],
      meters: [["线下社交", "LOW", 24], ["赛博社交", "OVERCLOCKED", 98], ["强迫症", "轻微（自称）", 71]],
    },
  },

  about: {
    title: "Mission Log",
    sub: "About me · 任务日志",
    quote: { text: "“你愿意卖一辈子甜水，还是跟我去改变世界？”", note: "我觉得可口可乐和苹果在全世界的影响力是相当的。" },
    entries: [
      { id: "life", head: "我是一个 **现充**（现实生活很充实的人）", body: "没有什么能够阻挡、我对自由的向往——**除了 💰**。", art: { src: "assets/claude-clever.jpg", alt: "你还能有 Claude 聪明？" } },
      { id: "moto", head: "突然爱上了 **摩托车**", body: "我本来对机动车一窍不通；但是自从跨上摩托车、发动机启动的那一刹那，那种汽油混合着空气、在发动机中爆燃产生的声音和震动让我心情愉悦。", chips: ["摩旅座驾 · 春风 450CL-C / 升仕 175V"], art: { src: "assets/wheel-strike.gif", alt: "骑着轮子的动感图标" } },
      { id: "ev", head: "**油改电** 了家人们！", list: ["九号 Mz330 闪骑", "九号机械师 Mmax 2"], art: { src: "assets/cat-ride.gif", alt: "骑电瓶车的小猫" } },
      { id: "game", head: "并不怎么爱玩电子游戏", body: "很久不玩手游了，所以每次同龄人开始聊游戏我都被排除在外。", list: ["但是会玩 **Cyberpunk 2077** / GTA / RDR2 / ETS 等单机 3A 作品，我比较热衷于感受游戏设计师营造的虚拟世界，如同我在过另一个人生。", "最近在品鉴童年美味 Minecraft", "影之刃零越打越瘆人，中式恐怖后背冒冷汗"], art: { src: "assets/maodie-dance.gif", alt: "跳舞的猫鼬们" } },
      { id: "lang", head: "对学习 **语言** 比较感兴趣", body: "喜欢学习各地的方言，因为人一多说话就紧张所以没去讲相声。", art: { src: "assets/cool-blue.gif", alt: "戴着蓝色假发的笑脸" } },
      { id: "match", head: "有没有 **假小子妹妹** 介绍给我 🥹", body: "> REQUEST PENDING… 等待匹配中", terminal: true, art: { src: "assets/qq-dance.gif", alt: "跳舞的企鹅" } },
    ],
  },

  neuro: {
    title: "Neural Status",
    sub: "精神状态 · 脑图神经链路",
    root: "🤣",
    branches: [
      { text: "工作顺利，多赚 money", children: ["开发顺利无 bug", "联调顺利不 delay", "测试顺利不打回", "上线顺利无 fatal"] },
      { text: "精神状态【非常稳定】", alt: true, children: ["放下个人素质，享受缺德人生", "拒绝精神内耗，有事直接发疯", "与其委屈自己，不如为难别人"] },
    ],
  },

  media: {
    title: "Braindance",
    sub: "超梦回放 · 两轮上的记忆",
    videos: [
      { cap: "BD_01 · LHASA", src: "assets/ride-tibet.mp4", poster: "assets/ride-tibet.jpg", tall: true, loop: true, muted: true },
      { cap: "BD_02 · CITY RIDE", src: "assets/ride-city.mp4", poster: "assets/ride-city.jpg" },
    ]
  },

  community: {
    title: "Live Signals",
    sub: "PUBLIC TRAFFIC · 实时访问统计",
    telemetry: {
      docName: "NAGISA Profile · Public",
      docId: "nagisa-profile-public",
      service: "https://server.steven.run",
      userMode: "fingerprint",
    },
  },

  contact: {
    title: "Find Me",
    sub: "联络终端 · 建立神经连接",
    okImage: "assets/deepseek-chan.gif",
    napStart: 12,
    napEnd: 14,
    lines: ["工作日早 10 晚 8", "周末 & 假期 free!"],
    channel: { title: "OPEN CHANNEL · TG", text: "点击按钮使用Telegram联系我", button: "【这是什么？点一下】", href: "https://t.me/IrisXe"},
  },

  footer: ["NAGISA.EXE · BUILT IN BEIJING · WAKE UP, SAMURAI."],
};
