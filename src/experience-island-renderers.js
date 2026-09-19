import { layoutExperienceMasonry } from "./experience-island-masonry.js";
import { createExperienceCardTilt } from "./experience-island-tilt.js";
import { chooseProofLayout, proofAvailableRect } from "./experience-proof-layout.js";

const CATEGORY_LABELS = { school: "SCHOOL", internship: "WORK", personal: "LAB" };
const EXPERIENCE_MASONRY_GAP = 24;
const EXPERIENCE_WORK_MASONRY_GAP = 14;
const EXPERIENCE_MASONRY_SINGLE_COLUMN_WIDTH = 560;
const EXPERIENCE_PROOF_GAP = 12;
const EXPERIENCE_PROOF_BOTTOM_SAFE_GAP = 32;

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const section = (label, className = "") => {
  const node = el("section", `experience-detail-section ${className}`.trim());
  const heading = el("h4", "experience-detail-label", label);
  node.append(heading);
  return node;
};

function setupExperienceMasonry(list) {
  let frame = 0;
  let observer = null;
  const cards = () => [...list.querySelectorAll("[data-masonry-item]")];
  const tiltControllers = cards().map(item => createExperienceCardTilt(item.querySelector("[data-experience-tilt]")));

  const layout = () => {
    frame = 0;
    const width = list.clientWidth;
    const items = cards();
    if (!width || !items.length) {
      list.style.height = "0px";
      return;
    }

    const isHorizontalOverview = Boolean(list.closest(".is-work-overview, .is-school-overview"));
    const masonryGap = isHorizontalOverview ? EXPERIENCE_WORK_MASONRY_GAP : EXPERIENCE_MASONRY_GAP;
    const columns = isHorizontalOverview || width <= EXPERIENCE_MASONRY_SINGLE_COLUMN_WIDTH ? 1 : 2;
    const columnWidth = columns === 1 ? width : (width - masonryGap) / 2;
    items.forEach(item => {
      item.style.width = `${columnWidth}px`;
      item.style.left = "0px";
      item.style.top = "0px";
    });

    const measurements = items.map(item => ({ key: item.dataset.projectKey, height: item.offsetHeight }));
    const result = layoutExperienceMasonry(measurements, { width, columns, gap: masonryGap });
    const placements = new Map(result.placements.map(item => [item.key, item]));
    items.forEach(item => {
      const placement = placements.get(item.dataset.projectKey);
      if (!placement) return;
      item.style.width = `${placement.width}px`;
      item.style.left = `${placement.x}px`;
      item.style.top = `${placement.y}px`;
    });
    list.style.height = `${result.height}px`;
  };

  const schedule = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(layout);
  };

  cards().forEach(item => item.querySelector("img")?.addEventListener("load", schedule));
  observer = new ResizeObserver(schedule);
  observer.observe(list);
  document.fonts?.ready.then(schedule);
  schedule();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    observer?.disconnect();
    tiltControllers.forEach(controller => controller.destroy());
  };
}

export function renderIslandOverview(container, content, onNavigate = null) {
  if (!container || !content) return;
  container.__experienceMasonryCleanup?.();
  container.replaceChildren();
  const overviewKind = content.eyebrow === "WORK" ? "work" : content.eyebrow === "SCHOOL" ? "school" : "lab";
  container.className = `experience-island-overview is-${overviewKind}-overview`;

  const kicker = el("p", "experience-overview-kicker", content.eyebrow);
  const title = el("h3", "experience-overview-title", content.title);
  const intro = el("p", "experience-overview-intro", content.intro);
  const heading = el("div", "experience-overview-heading");
  heading.append(kicker, el("span", "experience-overview-heading-separator", "·"), title);
  const projectSection = el("section", "experience-overview-projects");
  const list = el("ol", "experience-overview-list");

  content.projects.forEach((project, index) => {
    const entry = project.entry || {
      title: project.title,
      description: project.summary || "",
      previewImage: "",
    };
    const item = el("li", "experience-overview-item");
    item.dataset.masonryItem = "";
    item.dataset.projectKey = project.key;
    const tilt = el("span", "experience-project-tilt");
    tilt.dataset.experienceTilt = "";
    const button = el("button", "experience-project-link experience-project-card");
    button.type = "button";
    button.dataset.navigateProject = project.key;
    button.addEventListener("click", () => (onNavigate ? onNavigate(project.key) : window.experienceIslandNavigation?.navigateToProject(project.key)));
    button.setAttribute("aria-label", `${entry.title}，打开详情`);

    const media = el("span", "experience-project-card-media");
    if (entry.previewImage) {
      const image = document.createElement("img");
      image.src = entry.previewImage;
      image.alt = entry.title;
      image.loading = "lazy";
      image.decoding = "async";
      media.append(image);
    }

    const body = el("span", "experience-project-card-body");
    const meta = el("span", "experience-project-card-meta");
    meta.append(
      el("strong", "experience-project-name", entry.title),
    );
    if (project.period) meta.append(el("span", "experience-project-period", project.period));
    const description = el("small", "experience-project-summary", entry.description || project.summary || "");
    body.append(meta, description);
    button.append(media, body);
    tilt.append(button);
    item.append(tilt);
    list.append(item);
  });
  projectSection.append(list);
  container.append(heading, intro, projectSection);
  container.__experienceMasonryCleanup = setupExperienceMasonry(list);
}

export function canOpenExperienceMedia(slot) {
  return Boolean(slot?.src || slot?.preview || (slot?.type === "gallery" && slot?.items?.some(item => item?.src || item?.preview)));
}

function mediaTypeLabel(type) {
  return ({ image: "IMAGE", gallery: "GALLERY", video: "VIDEO", pdf: "PDF" }[type] || "MEDIA");
}

function mediaEntry(slot, item, index) {
  return { ...slot, ...(item || {}), id: item?.id || `${slot.id}-${index}`, type: item?.type || slot.type, label: item?.label || slot.label, hint: item?.hint || slot.hint };
}

export function openExperienceMediaInNewTab(slot, index = 0) {
  const item = slot?.type === "gallery" && Array.isArray(slot.items) && slot.items.length
    ? mediaEntry(slot, slot.items[index] || slot.items[0], index)
    : slot;
  const url = item?.src || item?.preview;
  if (!url || typeof window === "undefined" || typeof window.open !== "function") return false;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened) opened.opener = null;
  return Boolean(opened);
}

function scheduleProofLayout(container) {
  let frame = 0;
  const section = container.closest(".experience-detail-proof") || container;
  const scrollContainer = container.closest(".experience-copy");
  const layout = () => {
    frame = 0;
    const available = proofAvailableRect(section, { bottomSafeGap: EXPERIENCE_PROOF_BOTTOM_SAFE_GAP });
    const items = [...container.children].map(figure => ({
      id: figure.dataset.mediaId,
      aspectRatio: Number(figure.dataset.proofAspectRatio) || 1,
    }));
    const result = chooseProofLayout(items, { width: available.width, height: available.height, gap: EXPERIENCE_PROOF_GAP });
    container.style.height = `${Math.max(0, result.height)}px`;
    const placements = new Map(result.placements.map(item => [item.key, item]));
    [...container.children].forEach(figure => {
      const placement = placements.get(figure.dataset.mediaId);
      if (!placement) return;
      figure.style.left = `${placement.x}px`;
      figure.style.top = `${placement.y}px`;
      figure.style.width = `${placement.width}px`;
      figure.style.height = `${placement.height}px`;
    });
  };
  const schedule = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(layout);
  };
  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
  observer?.observe(section);
  window.addEventListener("resize", schedule, { passive: true });
  scrollContainer?.addEventListener("scroll", schedule, { passive: true });
  container.querySelectorAll("img").forEach(image => image.addEventListener("load", schedule));
  container.querySelectorAll("video").forEach(video => video.addEventListener("loadedmetadata", schedule));
  schedule();
  return () => {
    if (frame) cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("resize", schedule);
    scrollContainer?.removeEventListener("scroll", schedule);
  };
}

export function renderMediaGrid(container, slots = [], onOpenMedia = () => {}) {
  if (!container) return;
  container.__proofLayoutCleanup?.();
  container.replaceChildren();
  container.className = `experience-media-grid experience-proof-canvas ${slots.length === 1 ? "is-single" : slots.length > 1 ? "is-multi" : "is-empty"}`;
  slots.forEach(slot => {
    const figure = el("figure", `experience-media-slot experience-media-${slot.type || "image"}`);
    figure.dataset.mediaId = slot.id || "";
    figure.dataset.proofAspectRatio = String(Number(slot.aspectRatio || (slot.width && slot.height ? slot.width / slot.height : 1)) || 1);
    const sourceReady = canOpenExperienceMedia(slot);
    const entries = slot.type === "gallery" && Array.isArray(slot.items) && slot.items.length
      ? slot.items.map((item, index) => mediaEntry(slot, item, index)) : [slot];
    const preview = entries[0];

    if (sourceReady) {
      figure.classList.add("is-openable");
      figure.tabIndex = 0;
      figure.setAttribute("role", "button");
      figure.setAttribute("aria-label", `${slot.label || mediaTypeLabel(slot.type)}：${slot.hint || "在新标签页打开资料"}`);
      const open = () => onOpenMedia(slot, 0);
      figure.addEventListener("click", open);
      figure.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
      if (preview.type === "image" || preview.type === "gallery") {
        const image = document.createElement("img");
        image.src = preview.preview || preview.src;
        image.alt = preview.alt || slot.label || "项目媒体";
        figure.append(image);
      } else if (preview.type === "video") {
        const video = document.createElement("video");
        video.src = preview.src || "";
        if (preview.preview) video.poster = preview.preview;
        video.controls = false;
        video.preload = "metadata";
        video.playsInline = true;
        video.muted = true;
        figure.append(video);
      } else if (preview.type === "pdf") {
        const image = document.createElement("img");
        image.src = preview.preview || preview.src;
        image.alt = slot.label || "PDF 预览";
        image.loading = "lazy";
        image.decoding = "async";
        figure.append(image, el("span", "experience-proof-pdf-hint", "点击查看 PDF"));
      }
    } else {
      figure.classList.add("is-placeholder");
      const type = el("span", "experience-media-type", mediaTypeLabel(slot.type));
      const label = el("strong", "experience-media-label", slot.label || "MEDIA");
      const hint = el("small", "experience-media-hint", slot.hint || "资料待补充");
      figure.append(type, label, hint);
    }
    container.append(figure);
  });
  container.__proofLayoutCleanup = scheduleProofLayout(container);
}

function renderHeader(panel, project, island) {
  const category = CATEGORY_LABELS[project.category] || island?.eyebrow || "PROJECT";
  const header = el("header", "experience-detail-header");
  const eyebrow = el("p", "experience-detail-eyebrow", category === "WORK" ? "WORK EXPERIENCE" : category === "LAB" ? "PERSONAL LAB" : "SCHOOL PROJECT");
  const title = el("h3", "experience-detail-title", project.title);
  header.append(eyebrow, title);
  if (project.role || project.period) header.append(el("p", "experience-detail-meta", [project.role, project.period].filter(Boolean).join(" · ")));
  panel.append(header, el("div", "experience-detail-rule"));
}

function renderNumberedList(parent, items, className, dataAttribute) {
  const list = el("ol", className);
  (items || []).forEach((item, index) => {
    const row = el("li", "experience-detail-item");
    if (dataAttribute) row.dataset[dataAttribute] = "";
    row.append(el("span", "experience-detail-item-number", String(index + 1).padStart(2, "0")));
    const body = el("div", "experience-detail-item-body");
    body.append(el("h5", "experience-detail-item-title", item.title || item));
    if (item.body) body.append(el("p", "experience-detail-item-copy", item.body));
    row.append(body);
    list.append(row);
  });
  parent.append(list);
}

function renderProof(parent, project, onOpenMedia) {
  const proof = section("PROOF（在此区域下滑 / 点击试试）", "experience-detail-proof");
  const grid = el("div", "experience-media-grid");
  renderMediaGrid(grid, project.proofs?.length ? project.proofs : project.media || [], onOpenMedia);
  let awards = null;
  if (project.proofText?.length) {
    const list = el("ul", "experience-proof-list");
    project.proofText.forEach(item => list.append(el("li", "experience-proof-item", item)));
    awards = [...grid.children].find(node => /award/i.test(node.dataset.mediaId || ""));
    proof.append(grid);
    if (awards) {
      const group = el("div", "experience-proof-group experience-proof-awards");
      group.dataset.proofGroup = "awards";
      group.append(el("strong", "experience-proof-group-label", "AWARDS"), list);
      proof.append(group);
    } else {
      proof.append(list);
    }
    parent.append(proof);
    grid.__proofLayoutCleanup?.();
    grid.__proofLayoutCleanup = scheduleProofLayout(grid);
    return;
  }
  proof.append(grid);
  parent.append(proof);
  grid.__proofLayoutCleanup?.();
  grid.__proofLayoutCleanup = scheduleProofLayout(grid);
}

function renderSchool(panel, project, onOpenMedia) {
  const intro = section("项目介绍", "experience-detail-intro");
  intro.append(el("p", "experience-detail-lede", project.intro || project.summary));
  panel.append(intro);
  const did = section("WHAT I DID");
  renderNumberedList(did, project.whatIDid, "experience-detail-list", "whatIDid");
  panel.append(did);
  renderProof(panel, project, onOpenMedia);
}

function renderWork(panel, project, onOpenMedia) {
  const overview = section("工作概述", "experience-detail-intro");
  overview.append(el("p", "experience-detail-lede", project.summary));
  panel.append(overview);
  const work = section("工作内容");
  renderNumberedList(work, project.workItems || [], "experience-detail-list", "workItem");
  panel.append(work);
  const results = section("主要成果", "experience-detail-results");
  const metrics = el("div", "experience-metrics");
  (project.resultMetrics || project.results || []).forEach(metric => {
    const item = typeof metric === "string" ? { value: metric, label: "" } : metric;
    const metricNode = el("div", "experience-metric");
    metricNode.append(el("strong", "experience-metric-value", item.value), el("span", "experience-metric-label", item.label));
    metrics.append(metricNode);
  });
  results.append(metrics);
  panel.append(results);
  if (project.proofs?.length || project.media?.length) renderProof(panel, project, onOpenMedia);
}

function renderLab(panel, project, onOpenMedia) {
  if (project.link?.url) {
    const link = el("a", "experience-external-link");
    link.href = project.link.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", project.link.ariaLabel || `${project.link.label}（新标签页）`);
    link.append(el("span", "experience-external-link-label", project.link.label), el("strong", "experience-external-link-text", project.link.text || project.link.url), el("span", "experience-external-link-arrow", "↗"));
    panel.append(link);
  }
  const intro = section("产品介绍", "experience-detail-intro");
  intro.append(el("p", "experience-detail-lede", project.intro || project.summary));
  panel.append(intro);
  const highlights = section("HIGHLIGHTS");
  renderNumberedList(highlights, project.highlights || [], "experience-detail-list", "highlight");
  panel.append(highlights);
  if (project.proofs?.length || project.media?.length) renderProof(panel, project, onOpenMedia);
}

export function renderProjectDetail(panel, project, island, { onOpenMedia = () => {}, onRendered = () => {} } = {}) {
  if (!panel || !project) return;
  panel.querySelectorAll(".experience-proof-canvas").forEach(canvas => canvas.__proofLayoutCleanup?.());
  panel.replaceChildren();
  panel.className = `school-project-panel experience-detail experience-detail-${project.category}`;
  renderHeader(panel, project, island);
  if (project.category === "school") renderSchool(panel, project, onOpenMedia);
  else if (project.category === "internship") renderWork(panel, project, onOpenMedia);
  else renderLab(panel, project, onOpenMedia);
  onRendered(panel);
}

export function createExperienceMediaViewer(doc = document) {
  const overlay = el("div", "experience-media-viewer");
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "项目媒体预览");
  const backdrop = el("div", "experience-media-viewer-backdrop");
  const dialog = el("div", "experience-media-viewer-dialog");
  const close = el("button", "experience-media-viewer-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "关闭媒体预览");
  const previous = el("button", "experience-media-viewer-prev", "‹");
  const next = el("button", "experience-media-viewer-next", "›");
  previous.type = next.type = "button";
  previous.setAttribute("aria-label", "上一个媒体"); next.setAttribute("aria-label", "下一个媒体");
  const stage = el("div", "experience-media-viewer-stage");
  const counter = el("p", "experience-media-viewer-counter");
  dialog.append(close, previous, stage, next, counter);
  overlay.append(backdrop, dialog);
  doc.body.append(overlay);

  let current = null;
  let currentIndex = 0;
  let restoreFocus = null;
  const entries = () => current?.type === "gallery" && current.items?.length ? current.items.map((item, i) => mediaEntry(current, item, i)) : current ? [current] : [];
  const paint = () => {
    const list = entries();
    const item = list[currentIndex];
    stage.replaceChildren();
    if (!item) return;
    if (item.type === "image") {
      const image = doc.createElement("img"); image.src = item.src || item.preview; image.alt = item.alt || item.label || "项目媒体"; stage.append(image);
    } else if (item.type === "video") {
      const video = doc.createElement("video"); video.src = item.src; if (item.preview) video.poster = item.preview; video.controls = true; video.playsInline = true; video.preload = "metadata"; stage.append(video);
    } else if (item.type === "pdf") {
      const frame = doc.createElement("iframe"); frame.src = item.src; frame.title = item.label || "PDF 预览"; stage.append(frame);
      const fallback = el("a", "experience-media-viewer-fallback", "在新标签页打开 PDF ↗"); fallback.href = item.src; fallback.target = "_blank"; fallback.rel = "noopener noreferrer"; stage.append(fallback);
    }
    counter.textContent = list.length > 1 ? `${currentIndex + 1} / ${list.length}` : (item.label || "");
    previous.hidden = list.length < 2; next.hidden = list.length < 2;
  };
  const closeViewer = () => {
    stage.querySelectorAll("video").forEach(video => { video.pause(); video.removeAttribute("src"); video.load(); });
    overlay.hidden = true; current = null; currentIndex = 0; doc.body.classList.remove("experience-viewer-open"); restoreFocus?.focus(); restoreFocus = null;
  };
  const open = (slot, index = 0, source = null) => {
    if (!canOpenExperienceMedia(slot)) return false;
    current = slot; currentIndex = index; restoreFocus = source || doc.activeElement; overlay.hidden = false; doc.body.classList.add("experience-viewer-open"); paint(); close.focus(); return true;
  };
  close.addEventListener("click", closeViewer); backdrop.addEventListener("click", closeViewer);
  previous.addEventListener("click", () => { currentIndex = (currentIndex - 1 + entries().length) % entries().length; paint(); });
  next.addEventListener("click", () => { currentIndex = (currentIndex + 1) % entries().length; paint(); });
  doc.addEventListener("keydown", event => {
    if (overlay.hidden) return;
    if (event.key === "Escape") closeViewer();
    else if (event.key === "ArrowLeft" && !previous.hidden) previous.click();
    else if (event.key === "ArrowRight" && !next.hidden) next.click();
  });
  return { open, close: closeViewer, element: overlay };
}
