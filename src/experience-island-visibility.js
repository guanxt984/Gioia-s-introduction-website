export function selectFrontIsland(islands) {
  return islands.reduce((front, island) => {
    if (!front || island.depth > front.depth) return island;
    return front;
  }, null)?.category ?? null;
}

export function labelLimitForCategory(category) {
  return category === "internship" ? 4 : 3;
}

export function selectVisibleProjects(projects, activeCategory, limit = 3) {
  return projects
    .filter(project => project.category === activeCategory && project.inView)
    .sort((a, b) => b.depth - a.depth)
    .slice(0, limit)
    .map(project => project.key);
}
