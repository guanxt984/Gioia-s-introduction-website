export const skillDetails = {
  "insight": {
    "id": "insight",
    "group": "Think",
    "title": "需求洞察",
    "hook": "从真实 Query、海外内容趋势到一线设计师跟访，能快速识别高价值需求与核心痛点。",
    "evidence": [
      {
        "project": "Pollo AI",
        "title": "真实 Query 洞察",
        "text": "分析近三个月字幕相关 Query、核心场景和业务影响，判断字幕属于高优需求；进一步研究 200+ 海外爆款视频，提炼字幕风格偏好。"
      },
      {
        "project": "上海仟传",
        "title": "业务流程洞察",
        "text": "亲自参与 AI 素材生产并跟访设计师，识别多平台切换、Prompt 反复复制、ComfyUI 使用门槛高和经验难复用等核心问题。"
      },
      {
        "project": "杭州白米",
        "title": "用户研究",
        "text": "通过访谈、问卷、私域反馈、竞品与市场研究完成前期需求调研，为后续产品设计提供依据。"
      }
    ]
  },
  "product-planning": {
    "id": "product-planning",
    "group": "Think",
    "title": "产品规划",
    "hook": "连续参与多类 AI 产品从需求收敛到上线落地，并独立完成个人 AI 产品 0→1。",
    "evidence": [
      {
        "project": "Pollo AI",
        "title": "MVP 与产品边界",
        "text": "基于核心营销视频场景和竞品分析定义字幕 Skill MVP，并明确不做专业时间轴、自由参数编辑等能力边界。"
      },
      {
        "project": "上海仟传",
        "title": "复杂流程产品化",
        "text": "将原本分散的 LLM、ComfyUI 和本地文件流程重构为 Prompt、工作流、参数配置、结果筛选等标准产品能力。"
      },
      {
        "project": "个人 AI 项目",
        "title": "独立 0→1",
        "text": "从“AI 人设易漂移、长期陪伴缺乏连续性”出发，独立完成产品概念、功能架构、PRD 与可交互 Demo。"
      }
    ]
  },
  "data-analysis": {
    "id": "data-analysis",
    "group": "Think",
    "title": "数据分析",
    "hook": "同时做过 To C 用户行为分析与 Agent 灰度监控，用数据推动排序、运营与放量决策。",
    "evidence": [
      {
        "project": "理想汽车",
        "title": "行为数据驱动迭代",
        "text": "搭建数据看板，分析模板点击、保存、设为壁纸、再次生成等行为，判断用户偏好并指导模板排序与运营迭代。"
      },
      {
        "project": "Pollo AI",
        "title": "灰度数据判断",
        "text": "灰度阶段监控生成成功率、超时率、任务成本及核心漏斗，根据数据判断是否继续扩量并最终推动全量上线。"
      }
    ]
  },
  "collaboration": {
    "id": "collaboration",
    "group": "Think",
    "title": "项目协作",
    "hook": "连续三段 AI 产品实习参与真实上线项目，能独立 Own 模块，也能跨设计、研发、测试推进落地。",
    "evidence": [
      {
        "project": "Pollo AI",
        "title": "独立 Own 产品模块",
        "text": "完整推进字幕 Skill 从需求分析、PRD、策略设计、测试、灰度到全量上线，承担完整模块 Owner 职责。"
      },
      {
        "project": "理想汽车",
        "title": "多角色协同",
        "text": "协同 UI、研发和测试推进车机交互方案落地，并通过实车走查完成 UI / UX 验收。"
      },
      {
        "project": "上海仟传",
        "title": "产品与研发落地",
        "text": "与设计师、研发协作推进 AI 工作流产品化、API 接入联调和上线验收。"
      }
    ]
  },
  "ai-product-design": {
    "id": "ai-product-design",
    "group": "AI",
    "title": "AI 产品设计",
    "hook": "覆盖 Agent Skill、多模态内容产品与 Human-in-the-loop Workflow 三类 AI 产品形态。",
    "evidence": [
      {
        "project": "Pollo AI",
        "title": "Agent Skill",
        "text": "设计“意图识别—参数补全—工具调用—异步生成—结果返回”的 Agent 链路，并设计默认、追问、推荐和异常降级策略。"
      },
      {
        "project": "上海仟传",
        "title": "AI Workflow",
        "text": "将复杂 ComfyUI 节点和技术参数封装为少量业务参数，形成设计师可理解、可操作的 Human-in-the-loop AI Workflow。"
      },
      {
        "project": "理想汽车",
        "title": "多模态能力产品化",
        "text": "将图生图、图生视频模型能力转化为用户可直接使用的创意模板与车机任务流程。"
      }
    ]
  },
  "evaluation": {
    "id": "evaluation",
    "group": "AI",
    "title": "评测与迭代",
    "hook": "建立过模型、模板、Agent 与端到端生成链路的评测标准和回归机制。",
    "evidence": [
      {
        "project": "理想汽车",
        "title": "模型与模板评测",
        "text": "搭建多模态模型评测体系，从一致性、美感、稳定性和成本等维度进行模型选型，并制定创意模板上线准入标准。"
      },
      {
        "project": "Pollo AI",
        "title": "Agent 评测",
        "text": "构建覆盖多语言、画幅和异常场景的测试集，通过 Bad Case 回归与灰度数据验证 Agent 任务稳定性。"
      },
      {
        "project": "上海仟传",
        "title": "端到端质量治理",
        "text": "将生成问题归因至 LLM、Prompt、RAG、ComfyUI 工作流、参数或交互，并通过回归测试持续迭代。"
      }
    ]
  },
  "prompt-engineering": {
    "id": "prompt-engineering",
    "group": "AI",
    "title": "Prompt 工程",
    "hook": "具备 System Prompt、模板 Prompt、Prompt 知识库与 RAG 检索增强的真实项目经验。",
    "evidence": [
      {
        "project": "上海仟传",
        "title": "Prompt + RAG",
        "text": "建设 Prompt 知识库，将优秀 Prompt、LoRA 触发词和场景模块通过 RAG 检索后交由 LLM 组合生成。"
      },
      {
        "project": "上海仟传",
        "title": "System Prompt 迭代",
        "text": "基于真实任务和 Bad Case 持续优化 System Prompt、回复结构及目标工作流适配性。"
      },
      {
        "project": "理想汽车",
        "title": "模板 Prompt 优化",
        "text": "结合模板生成 Bad Case 调整 Prompt，提升生成质量并推动创意模板达到上线标准。"
      }
    ]
  },
  "ai-exploration": {
    "id": "ai-exploration",
    "group": "AI",
    "title": "AI 实践探索",
    "hook": "能用 Claude Code、Coze、ComfyUI 快速完成 AI 产品原型、工作流验证与持续迭代。",
    "evidence": [
      {
        "project": "个人成长 AI 产品",
        "title": "Vibe Coding",
        "text": "使用 Claude Code 独立完成个人成长 AI 产品从概念、PRD 到可交互 Demo，并进行了约两个月真实使用和持续迭代。"
      },
      {
        "project": "上海仟传",
        "title": "快速技术验证",
        "text": "独立使用 Coze 搭建核心 AI Workflow 原型，快速验证业务流程和产品方案可行性。"
      },
      {
        "project": "多种 AI 工具实践",
        "title": "",
        "text": "在真实项目中使用 Claude Code、ComfyUI、RAG、Coze 等完成原型验证和 AI 能力产品化。"
      }
    ]
  },
  "design-visualization": {
    "id": "design-visualization",
    "group": "Tool",
    "title": "设计与可视化",
    "hook": "工业设计背景结合 Figma、MasterGo、Photoshop 与交互 Demo，能把产品想法快速转成可讨论、可评审的视觉方案。",
    "evidence": [
      {
        "project": "理想汽车",
        "title": "交互原型",
        "text": "使用 MasterGo、Figma 梳理用户流程并制作低保真交互原型，配合可交互 Demo 完成方案评审与体验验证。"
      },
      {
        "project": "个人 AI 项目",
        "title": "界面落地",
        "text": "从功能架构一路推进到界面实现，并持续迭代 PC 与手机端体验，让产品概念真正变成可操作 Demo。"
      },
      {
        "project": "设计工具基础",
        "title": "视觉表达",
        "text": "具备 Figma、Photoshop 等设计工具基础，可完成产品原型、视觉表达与方案沟通。"
      }
    ]
  },
  "multimodal-generation": {
    "id": "multimodal-generation",
    "group": "Tool",
    "title": "多模态生成",
    "hook": "实际做过图生图、图生视频与营销素材生成，覆盖模型评测、创意模板和 ComfyUI 工作流。",
    "evidence": [
      {
        "project": "理想汽车",
        "title": "图像 / 视频生成",
        "text": "参与图生图、图生视频模型评测与接入，对比模型的一致性、美感、稳定性和成本，并推动创意模板上线。"
      },
      {
        "project": "上海仟传",
        "title": "ComfyUI 生产工作流",
        "text": "实际参与营销素材生成，将 ComfyUI 工作流接入产品链路，并围绕 Prompt、参数和生成结果持续优化。"
      },
      {
        "project": "多模态工具实践",
        "title": "AI 生图",
        "text": "具备 ComfyUI 及 AI 生图模型 / 工具的真实项目使用经验，能够理解生成链路与工作流配置。"
      }
    ]
  },
  "coding-basics": {
    "id": "coding-basics",
    "group": "Tool",
    "title": "代码基础",
    "hook": "具备 Python、C++ 基础，并能用 Claude Code、Cursor 把产品想法快速做成可交互 Demo。",
    "evidence": [
      {
        "project": "个人 AI 项目",
        "title": "Vibe Coding",
        "text": "使用 Claude Code 通过多轮协作完成产品概念拆解、功能定义、PRD 与界面实现，独立做出可交互产品 Demo。"
      },
      {
        "project": "理想汽车",
        "title": "快速原型开发",
        "text": "借助 Claude Code 搭建可交互 Demo，用于车机方案评审、体验验证和需求沟通。"
      },
      {
        "project": "基础编程",
        "title": "轻量任务处理",
        "text": "具备 Python、C++ 基础，可编写简单脚本完成数据处理或项目任务，同时能理解产品方案中的基础技术链路。"
      }
    ]
  },
  "ai-collaboration": {
    "id": "ai-collaboration",
    "group": "Tool",
    "title": "AI 协作效率",
    "hook": "习惯把 AI 融入产品工作流，覆盖需求拆解、PRD、原型验证、界面实现与技术方案沟通。",
    "evidence": [
      {
        "project": "个人 AI 项目",
        "title": "AI 协作式产品开发",
        "text": "通过 Claude Code 多轮协作完成产品概念拆解、功能定义、PRD 和界面实现，形成完整的 AI 辅助产品开发流程。"
      },
      {
        "project": "上海仟传",
        "title": "AI 快速验证",
        "text": "独立使用 Coze 搭建核心工作流原型，在正式开发前快速验证产品流程与技术可行性。"
      },
      {
        "project": "日常产品工作",
        "title": "AI Coding",
        "text": "使用 Claude Code、Cursor 等 AI 编程工具制作可交互 Demo，用于概念验证、需求沟通和方案迭代。"
      }
    ]
  }
};
