import { PROOF_CONTENT } from "./experience-proof-content.js";

const media = (id, type, label, hint) => ({ id, type, preview: null, src: null, label, hint });

const PROJECT_ENTRY_METADATA = {
  "internship-pollo-ai": {
    title: "Pollo AI",
    description: "围绕 Agent 字幕能力，推动字幕 Skill 从需求洞察到灰度上线。",
    previewImage: "./assets/experience-island-index/internship-pollo-ai/preview.png",
    cta: "查看经历",
  },
  "internship-lixiang": {
    title: "理想汽车",
    description: "参与车载 AIGC 创意应用「艺术相框」，负责原型、模型评测与上线迭代。",
    previewImage: "./assets/experience-island-index/internship-lixiang/preview.png",
    cta: "查看经历",
  },
  "internship-qianchuan": {
    title: "上海仟传",
    description: "参与 AI 生产工作台 0→1 建设，推动设计团队 AIGC 流程产品化。",
    previewImage: "./assets/experience-island-index/internship-qianchuan/preview.png",
    cta: "查看经历",
  },
  "internship-baimi": {
    title: "杭州白米",
    description: "通过用户与市场研究，为工业设计项目的前期产品定义提供依据。",
    previewImage: "./assets/experience-island-index/internship-baimi/preview.png",
    cta: "查看经历",
  },
  "school-cell-factory": {
    title: "Cell Factory｜细胞工厂",
    description: "面向 8–14 岁青少年的细胞科普策略游戏，最终完成 iOS 可运行 Demo。",
    previewImage: "./assets/experience-island-index/school-cell-factory/preview.png",
    cta: "查看项目",
  },
  "school-apex": {
    title: "APEX｜凌岳",
    description: "结合人体运动分析、传感器与电机控制的智能登山助力外骨骼实物原型。",
    previewImage: "./assets/experience-island-index/school-apex/preview.png",
    cta: "查看项目",
  },
  "school-memora": {
    title: "MEMORA",
    description: "面向临终老人及家属的心愿实现与记忆留存服务系统。",
    previewImage: "./assets/experience-island-index/school-memora/preview.png",
    cta: "查看项目",
  },
  "personal-fullydancy": {
    title: "FullyDancy",
    description: "浏览器端 AI 姿态识别舞蹈跟练产品，通过摄像头实现实时互动练习。",
    previewImage: "./assets/experience-island-index/personal-fullydancy/preview.png",
    cta: "查看项目",
  },
  "personal-squirrel-docs": {
    title: "松鼠文仓",
    description: "把碎片信息逐渐沉淀为结构化主题文档的个人信息整理工具。",
    previewImage: "./assets/experience-island-index/personal-squirrel-docs/preview.png",
    cta: "查看项目",
  },
  "personal-comfyui": {
    title: "ComfyUI",
    description: "围绕汽车 AIGC 生图与换车需求搭建并发布的可复用 Workflow。",
    previewImage: "./assets/experience-island-index/personal-comfyui/preview.png",
    cta: "查看项目",
  },
};

const attachEntryMetadata = projects => projects.map(project => ({
  ...project,
  entry: PROJECT_ENTRY_METADATA[project.key],
  proofs: PROOF_CONTENT[project.key] || [],
}));

const schoolProjects = attachEntryMetadata([
  {
    key: "school-cell-factory", title: "细胞工厂", summary: "将细胞生物学转化为策略游戏机制，并最终完成可在 iOS 设备运行的游戏 Demo。",
    intro: "一款面向 8–14 岁青少年的细胞科普策略游戏。将蛋白质合成、ATP 供能等复杂细胞生命活动转译为生产线搭建、资源调配与关卡任务，让玩家在经营一个“细胞工厂”的过程中理解细胞器及生命活动。",
    whatIDid: [
      { title: "知识游戏化转译", body: "将核糖体、线粒体等细胞器的真实功能映射为生产车间、资源与生产线机制，并围绕不同人体细胞设计关卡与任务。" },
      { title: "游戏体验与视觉设计", body: "参与游戏信息架构、关卡选择、战斗沙盘、细胞图鉴等核心体验设计，并确定低多边形的视觉风格，完成 UI/UX 设计。" },
      { title: "可玩 Demo 落地", body: "使用 Cursor 辅助完成游戏运行代码，并通过 Xcode 完成 iOS 端调试和运行，将设计方案推进为可在真实设备上操作体验的游戏 Demo。" },
    ],
    media: [media("cell-factory-film", "video", "PROJECT FILM", "点击播放项目视频"), { ...media("cell-factory-awards", "gallery", "AWARDS", "点击查看获奖证明"), items: [] }],
    proofText: ["2025 第十三届未来设计师二等奖", "2025 移动应用创新赛三等奖", "2026 G-CROSS AWARD"],
  },
  {
    key: "school-apex", title: "APEX｜凌岳登山助力外骨骼", summary: "从人体运动分析、机械结构到 IMU 步态识别与电机控制，完成智能登山助力外骨骼实物原型。",
    intro: "一款面向户外爱好者的智能登山助力外骨骼。通过腰—膝仿生传力机构与腿部惯性传感器感知步态，在登山抬腿与蹬伸过程中控制助力机构，将人体运动分析、工业设计、嵌入式控制整合为可穿戴实物原型。",
    whatIDid: [
      { title: "仿生助力机构设计", body: "分析登山蹬腿过程与股四头肌发力路径，通过人体动作与行程测量确定腰—膝传力方式，并持续迭代穿戴结构和技术路线。" },
      { title: "步态识别与控制逻辑", body: "使用 BMI160 惯性传感器采集左右腿运动数据，根据波峰波谷判断动作状态，并设计双腿电机状态机与动态延迟控制逻辑。" },
      { title: "实物原型与测试迭代", body: "参与产品建模、电子元件集成、结构装配、实际穿戴与运动测试，将传感器、电机、电控与机械结构整合成真实可运行原型。" },
    ],
    media: [media("apex-film", "video", "PROJECT FILM", "点击播放项目视频"), media("apex-board", "image", "PROJECT BOARD", "点击放大查看")],
  },
  {
    key: "school-memora", title: "MEMORA", summary: "围绕临终老人及其家属的记忆与心愿需求，设计融合实体产品、数字端与志愿服务的完整服务系统。",
    intro: "一套面向临终老人及其家属的心愿实现与记忆留存服务系统。通过实体记忆终端、NFC 记忆载体与手机端，串联记忆保存、心愿实现与家庭情感连接，构建完整的软硬件服务体验。",
    whatIDid: [
      { title: "用户与情境洞察", body: "围绕临终老人及家属开展桌面研究、利益相关者与用户旅程分析，从复杂情境中提炼记忆留存、心愿表达和情感连接等核心需求。" },
      { title: "服务系统设计", body: "构建老人、家属、志愿者、实体终端与数字端之间的服务关系，完成服务系统图、服务蓝图、触点设计以及 As-is / To-be 用户旅程。" },
      { title: "UI/UX 设计", body: "完成 MEMORA 手机端 APP 的核心交互设计，完成低保真原型、风格确定及最终效果呈现。" },
    ], media: [media("memora-project", "pdf", "FULL PROJECT", "点击查看完整 PDF")],
  },
]);

const workProjects = attachEntryMetadata([
  {
    key: "internship-pollo-ai", title: "Pollo AI", role: "Agent 产品实习生", period: "2026.06 – 2026.09",
    summary: "围绕面向海外市场的「Pollo.ai」中的「Agent-字幕能力」展开，核心目标为字幕能力 0-1 落地，打造快速成片体验。",
    workItems: [
      { title: "海外市场调研洞察", body: "分析近三个月线上字幕相关 Query 的出现频率、核心场景及业务影响，判断字幕能力为高优需求；分析 TikTok、YouTube 等平台的 200+ 爆款短视频样本，归纳海外用户对字幕风格的偏好，筛选 12 款首发预设字幕样式。" },
      { title: "MVP 产品方案规划", body: "对比 5 款海外同类产品，结合海外营销视频创作者快速成片的核心诉求，定义“自然语言控制 + 内置样式模板 + 独立版本存储”的 MVP 产品方案；明确功能边界、用户流程、Agent 对话规则，输出 PRD 并推动评审落地。" },
      { title: "Agent 链路与策略设计", body: "设计“意图识别—目标与参数补全—字幕工具调用—异步生成—结果返回”的 Agent 链路；根据 MECE 原则拆解首次添加、文本修改、样式切换及异常输入等场景，制定直接执行、智能推荐、追问澄清和异常降级的处理策略；通过字幕样式标签匹配用户描述，并在多轮对话中继承任务参数，支持连续修改而不覆盖原视频。" },
      { title: "功能验收与灰度迭代", body: "构建覆盖 9 种语言、3 种画幅及异常场景的评测集，制定分场景验收标准，完成功能验收与 badcase 回归；制定灰度测试方案，完成分阶段放量，监控生成成功率、超时率、任务成本及核心漏斗，推动功能稳定全量上线。" },
    ],
    results: ["按期完成全量上线", "上线首周字幕任务成功率 86.3%", "字幕结果满意度 76%", "涉及字幕任务的对话占比 11.0% → 23.5%"],
    resultMetrics: [{ value: "86.3%", label: "上线首周字幕任务成功率" }, { value: "76%", label: "字幕结果满意度" }, { value: "11.0% → 23.5%", label: "涉及字幕任务的对话占比" }, { value: "全量上线", label: "按期完成" }],
  },
  {
    key: "internship-lixiang", title: "理想汽车", role: "AI 产品实习生 · To C", period: "2025.12 – 2026.05",
    summary: "围绕车机端创意应用「艺术相框」展开，核心目标为把控产品落地效果，并基于数据优化 AI 屏保体验，提升 WAU 和用户满意度。",
    workItems: [
      { title: "车机交互原型落地", body: "梳理首页浏览、生成发起及相册管理等核心任务流程，使用 MasterGO、Figma 输出用户流程图与低保真原型；借助 Claude Code 搭建可交互 Demo，完成方案评审与体验验证；协同设计、研发及测试推进方案落地，并实车走查完成 UI、UX 验收。" },
      { title: "模型评测选型接入", body: "主导生图与生视频模型评测选型，搭建由“现有模板实战测试”“核心能力专项测试”组成的评测集，重点考察一致性维持、视觉美感及生成稳定性；对比 5 个 AI 模型，综合生成效果、调用成本与现有能力短板，输出选型报告及接入建议。" },
      { title: "创意模板评测上线", body: "参与创意模板从策划到上线的全流程。结合公司理念、产品目标、AI 热点，策划具备传播潜力的模板方案；根据不同模板特性制定可量化、可评分的生成质量评测标准，明确主体偏移率等评分维度；协同测试开展 Prompt 通用性测试，完成 badcase 分类归因与 Prompt 调优，推动模板生成结果通过率高于 80% 并上线。" },
      { title: "数据分析运营迭代", body: "搭建数据看板，追踪 WAU、模板点击率、生成率，及设为屏保、重新生成等生成后行为，输出数据复盘报告，判断用户偏好并形成运营判断；针对重新生成率偏高等数据异常开展问题归因，采取调整模板排序等相应措施，推动应用体验优化。" },
    ],
    results: ["DAU / 汽车保有量峰值 18%", "功能上线三日渗透率 37%", "平均次日留存率 35.2%", "“裸眼 3D 萌宠”单日生成次数峰值 3w", "应用相关话题进入微博、抖音热搜前十", "收到访谈和线下公益活动邀请"],
    resultMetrics: [{ value: "18%", label: "DAU / 汽车保有量峰值" }, { value: "37%", label: "功能上线三日渗透率" }, { value: "35.2%", label: "平均次日留存率" }, { value: "3w", label: "“裸眼 3D 萌宠”单日生成次数峰值" }, { value: "TOP 10", label: "相关话题进入微博、抖音热搜前十" }, { value: "2 项", label: "访谈与线下公益活动邀请" }],
  },
  {
    key: "internship-qianchuan", title: "上海仟传", role: "AI 产品实习生 · To B", period: "2025.06 – 2025.12",
    summary: "围绕面向内部设计团队的「AI 生产工作台」展开，核心目标为工作台 0-1 落地，降低需求生产耗时，提高生成图可用率。",
    workItems: [
      { title: "需求调研与产品规划", body: "通过参与实际生产过程、访谈设计团队及复盘历史项目，拆解“甲方需求理解—Prompt 编写—多轮生成—素材交付”流程，识别多平台切换、资产难管理和经验难复用等问题；明确 AI 创作和资产管理一体化的产品方向，据此规划 Prompt 辅助生成、工作流接入、参数配置及资产管理等核心能力；使用 Coze 搭建 workflow 原型，验证业务可行性。" },
      { title: "工作流接入与产品化", body: "将设计师使用 ComfyUI 的生成流程抽象为可配置工作流；定义 Generation Spec，将 Prompt、参考素材及生成参数封装为标准业务字段；负责工作流注册，并协同研发完成 Liblib API 接入与联调，打通 Prompt 撰写、生图执行的完整链路。" },
      { title: "经验复用与效果迭代", body: "建立生成图与生成数据的关联记录，设计交付状态、品牌型号和画面风格等标签，支持结果筛选、过程复现与交付管理；协同设计团队沉淀优质 Prompt 知识库，落地 RAG 混合检索，支持相似案例及团队经验复用；通过真实需求案例测试生成图画面效果与可用率，根据 badcase 持续优化 System Prompt，提高 LLM 生成内容的稳定性、完整性和公司业务适配度。" },
    ],
    results: ["单组需求图平均生产耗时 53 分钟（53min） → 26 分钟（26min）", "缩短 51%", "生成图可用率 85%+", "沉淀 200+ 优质 Prompt", "支持多品牌快速接入", "AI 素材帖相较传统宣传帖平均评论率提升 237%", "单帖最高浏览量 13 万"],
    resultMetrics: [{ value: "53 → 26 min", label: "单组需求图平均生产耗时" }, { value: "51%", label: "耗时缩短" }, { value: "85%+", label: "生成图可用率" }, { value: "200+", label: "优质 Prompt" }, { value: "237%", label: "AI 素材帖平均评论率提升" }, { value: "13 万", label: "单帖最高浏览量" }],
  },
  {
    key: "internship-baimi", title: "杭州白米工业设计", role: "产品设计助理", period: "2025.01 – 2025.03",
    summary: "围绕工业设计项目的前期调研展开，核心目标为识别用户需求与市场机会、为后续产品设计提供依据。",
    workItems: [{ title: "用户市场前期调研", body: "通过访谈、问卷及私域群等渠道收集并整理用户反馈，系统开展竞品分析与市场研究，输出 8+ 前期调研报告。" }],
    results: ["输出 8+ 前期调研报告", "为后续产品设计提供研究依据"],
    resultMetrics: [{ value: "8+", label: "前期调研报告" }, { value: "研究依据", label: "支持后续产品设计" }],
  },
]);

const labProjects = attachEntryMetadata([
  {
    key: "personal-fullydancy", title: "FullyDancy", summary: "通过浏览器本地姿态识别、卡点与实时反馈，探索 AI 能力如何进入互动舞蹈跟练体验。",
    intro: "一款浏览器端互动舞蹈跟练产品，通过摄像头实时姿态识别、可编辑卡点与命中 / 连击反馈，把舞蹈练习变成具有即时反馈的互动训练体验。",
    link: { label: "体验链接", text: "fullydancy.onrender.com", url: "https://fullydancy.onrender.com/", ariaLabel: "打开 FullyDancy 体验链接（新标签页）" },
    highlights: [
      { title: "把姿态识别转化为真实产品能力", body: "接入 MediaPipe 浏览器端姿态识别，将人体关键点、示范动作与视频时间轴结合，设计卡点命中、Perfect / Great / Miss 与连击等规则反馈，让“识别人体”真正参与到练舞体验中。" },
      { title: "设计完整的互动跟练闭环", body: "从卡点编辑、摄像头校准、倒计时进入练习，到手势控制暂停、结果反馈、重新练习与调整卡点，构建完整的舞蹈跟练流程，并针对摄像头中断、媒体失败等异常状态设计恢复路径。" },
      { title: "将产品真正实现并上线", body: "使用 React + TypeScript + Vite 完成 Web 端产品实现，让姿态推理直接在浏览器本地运行，并将产品部署为可直接访问和体验的网站。" },
    ], media: [],
  },
  {
    key: "personal-squirrel-docs", title: "松鼠文仓", summary: "从碎片信息难以持续积累的问题出发，把零散记录逐步整理成可阅读、可编辑的结构化主题文档。",
    intro: "一款把经验、摘抄、灵感和聊天记录等零散信息先保存为“松果”，再逐步整理成可阅读、可编辑、可持续补充的结构化主题文档的个人信息整理工具。",
    link: { label: "体验链接", text: "songshu-wencang.onrender.com", url: "https://songshu-wencang.onrender.com/", ariaLabel: "打开松鼠文仓体验链接（新标签页）" },
    highlights: [
      { title: "重新设计“先记录，再整理”的信息流", body: "围绕碎片信息难以持续积累的问题，设计“松果 → 暂存栏 → 松果架 → 结构化文档”的信息模型，让用户无需在记录时提前想好分类，同时保留整理结果与原始内容之间的来源关系。" },
      { title: "构建完整的个人知识整理闭环", body: "实现松鼠仓创建、碎片收集、暂存、自动整理、文档阅读与编辑、松果搜索和持续补充等核心流程，让一次性的随手记录逐渐沉淀成可以长期维护的主题内容。" },
      { title: "从产品设计推进到完整 Web 产品", body: "完成从前端交互到 Node.js API、GitHub OAuth、PostgreSQL 云端存储的产品实现，同时支持游客本地保存与登录用户云端仓库，将个人想法推进为可直接访问和使用的线上产品。" },
    ], media: [],
  },
  {
    key: "personal-comfyui", title: "ComfyUI", summary: "围绕真实汽车 AIGC 需求搭建和发布可复用 Workflow，将复杂生成流程封装成更加可控的一键工作流。",
    intro: "围绕真实的汽车 AIGC 生图与换车需求，持续搭建、调试并发布 ComfyUI Workflow，将原本依赖 WebUI、Photoshop 和大量人工操作的复杂流程，封装为更稳定、可调控、可复用的一键生成工作流。",
    link: { label: "查看链接", text: "Liblib 工作流主页", url: "https://www.liblib.art/userpage/8aa471a4de584390bc7b3db3083aef31/publish/workflow", ariaLabel: "打开 Liblib 工作流主页（新标签页）" },
    highlights: [
      { title: "将复杂生成流程封装为可复用 Workflow", body: "针对传统换车流程步骤繁琐、依赖 WebUI + Photoshop、人工操作成本高的问题，将目标图、重绘底图、图像拼接、换车与后处理等步骤重新拆解并串联，并组合 FLUX Fill、IPAdapter、Depth Control 等能力提升生成稳定性与可控性。" },
      { title: "从个人实验走向真实用户使用", body: "将成熟 Workflow 发布至 Liblib 平台，其中已发布工作流累计获得约 3.5k 次使用，证明工作流不只能够运行，也具备真实创作场景中的复用价值。" },
    ],
    media: [
      media("comfyui-board", "image", "WORKFLOW BOARD", "资料待补充"),
      { ...media("comfyui-nodes", "gallery", "NODE DIAGRAM", "资料待补充"), items: [] },
      media("comfyui-results", "image", "BEFORE / AFTER", "资料待补充"),
      media("comfyui-proof", "image", "LIBLIB PROOF", "资料待补充"),
    ],
  },
]);

export const ISLAND_CONTENT = {
  school: { eyebrow: "SCHOOL", title: "学校项目", intro: "工业设计专业让我跨越不同媒介，从 UI/UX、软硬件落地到服务系统设计。", projects: schoolProjects },
  internship: { eyebrow: "WORK", title: "实习经历", intro: "四段实习让我从用户研究一路走进 AI Workflow、AIGC 产品与 Agent Skill 的真实落地。", projects: workProjects },
  personal: { eyebrow: "LAB", title: "个人实验室", intro: "我会把对 AI 和新工具的好奇，快速变成一个能运行、能验证、能被使用的东西。", projects: labProjects },
};

export const PROJECT_CONTENT = new Map(Object.values(ISLAND_CONTENT).flatMap(island => island.projects.map(project => [project.key, project])));
