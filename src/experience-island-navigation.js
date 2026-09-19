export function createExperienceNavigationState(activeCategory = null) {
  return { activeCategory, selectedProjectKey: null, navigationMode: "manual" };
}

export function commitManualCategory(state, activeCategory) {
  return { ...state, activeCategory, selectedProjectKey: null, navigationMode: "manual" };
}

export function beginProgrammaticNavigation(state, targetCategory, targetProjectKey = null) {
  return { ...state, navigationMode: "programmatic" };
}

export function finishProgrammaticNavigation(state, targetCategory, targetProjectKey = null) {
  return {
    ...state,
    activeCategory: targetCategory,
    selectedProjectKey: targetProjectKey,
    navigationMode: "manual",
  };
}

export function cancelProgrammaticNavigation(state) {
  return { ...state, navigationMode: "manual" };
}
