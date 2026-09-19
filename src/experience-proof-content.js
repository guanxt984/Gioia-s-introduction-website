const proof = (id, type, src, width, height, extra = {}) => ({
  id,
  type,
  src,
  width,
  height,
  aspectRatio: width / height,
  ...extra,
});

const image = (id, src, width, height, extra = {}) => proof(id, "image", src, width, height, extra);
const video = (id, src, width, height, extra = {}) => proof(id, "video", src, width, height, extra);
const pdf = (id, src, preview, width, height, extra = {}) => proof(id, "pdf", src, width, height, { preview, ...extra });

export const PROOF_CONTENT = Object.freeze({
  "school-cell-factory": [
    video("cell-factory-video", "./assets/experience-island-proof/school-cell-factory/01-project-video.mp4", 854, 480, { label: "PROJECT VIDEO" }),
    image("cell-factory-awards", "./assets/experience-island-proof/school-cell-factory/02-project-board.png", 1349, 614, { label: "AWARDS" }),
  ],
  "school-apex": [
    video("apex-video", "./assets/experience-island-proof/school-apex/01-project-video.mp4", 1080, 2560, { label: "PROJECT VIDEO" }),
    image("apex-board", "./assets/experience-island-proof/school-apex/02-project-board.png", 8000, 17380, { label: "PROJECT BOARD" }),
  ],
  "school-memora": [
    pdf(
      "memora-project",
      "./assets/experience-island-proof/school-memora/01-full-project.pdf",
      "./assets/experience-island-proof/school-memora/01-full-project-preview.png",
      1600,
      900,
      { label: "FULL PROJECT" },
    ),
  ],
  "internship-pollo-ai": [
    image("pollo-proof-01", "./assets/experience-island-proof/internship-pollo-ai/01-proof.jpg", 1024, 196, { label: "PROJECT PROOF" }),
    image("pollo-proof-02", "./assets/experience-island-proof/internship-pollo-ai/02-proof.jpg", 1024, 914, { label: "PROJECT PROOF" }),
    image("pollo-proof-03", "./assets/experience-island-proof/internship-pollo-ai/03-proof.jpg", 1166, 1754, { label: "PROJECT PROOF" }),
  ],
  "internship-lixiang": [
    image("lixiang-certificate", "./assets/experience-island-proof/internship-lixiang/01-certificate.png", 1240, 1753, { label: "CERTIFICATE" }),
    image("lixiang-proof-02", "./assets/experience-island-proof/internship-lixiang/02-proof.png", 931, 1182, { label: "PROJECT PROOF" }),
    image("lixiang-proof-03", "./assets/experience-island-proof/internship-lixiang/03-proof.png", 1920, 903, { label: "PROJECT PROOF" }),
  ],
  "internship-qianchuan": [
    image("qianchuan-proof", "./assets/experience-island-proof/internship-qianchuan/01-proof.png", 780, 1106, { label: "PROJECT PROOF" }),
  ],
  "internship-baimi": [
    image("baimi-proof", "./assets/experience-island-proof/internship-baimi/01-proof.jpg", 2085, 2780, { label: "PROJECT PROOF" }),
  ],
  "personal-fullydancy": [
    image("fullydancy-screen-01", "./assets/experience-island-proof/personal-fullydancy/01-screen.png", 1280, 665, { label: "PRODUCT SCREEN" }),
    image("fullydancy-screen-02", "./assets/experience-island-proof/personal-fullydancy/02-screen.png", 1280, 665, { label: "PRODUCT SCREEN" }),
    image("fullydancy-screen-03", "./assets/experience-island-proof/personal-fullydancy/03-screen.png", 1280, 665, { label: "PRODUCT SCREEN" }),
    image("fullydancy-screen-04", "./assets/experience-island-proof/personal-fullydancy/04-screen.png", 1280, 665, { label: "PRODUCT SCREEN" }),
  ],
  "personal-squirrel-docs": [
    image("squirrel-product", "./assets/experience-island-proof/personal-squirrel-docs/01-product.png", 1280, 666, { label: "PRODUCT SCREEN" }),
    image("squirrel-logo", "./assets/experience-island-proof/personal-squirrel-docs/02-logo.png", 1254, 1254, { label: "PROJECT MARK" }),
  ],
  "personal-comfyui": [
    image("comfyui-workflow", "./assets/experience-island-proof/personal-comfyui/01-workflow.png", 3840, 1740, { label: "WORKFLOW BOARD" }),
    image("comfyui-workflow-header", "./assets/experience-island-proof/personal-comfyui/02-workflow-header.png", 698, 97, { label: "WORKFLOW PROOF" }),
    image("comfyui-change-car", "./assets/experience-island-proof/personal-comfyui/03-change-car.png", 3840, 2160, { label: "WORKFLOW BOARD" }),
    image("comfyui-flux", "./assets/experience-island-proof/personal-comfyui/04-flux.png", 3840, 2160, { label: "WORKFLOW BOARD" }),
  ],
});

export const PROOF_PROJECT_KEYS = Object.freeze(Object.keys(PROOF_CONTENT));
