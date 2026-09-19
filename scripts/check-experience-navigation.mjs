import assert from "node:assert/strict";
import {
  createExperienceNavigationState,
  commitManualCategory,
  beginProgrammaticNavigation,
  finishProgrammaticNavigation,
  cancelProgrammaticNavigation,
} from "../src/experience-island-navigation.js";
import { ISLAND_CONTENT, PROJECT_CONTENT } from "../src/experience-island-content.js";

const initial = createExperienceNavigationState("school");
assert.deepEqual(initial, { activeCategory: "school", selectedProjectKey: null, navigationMode: "manual" });
const selected = { ...initial, selectedProjectKey: "school-apex" };
assert.deepEqual(commitManualCategory(selected, "internship"), {
  activeCategory: "internship", selectedProjectKey: null, navigationMode: "manual",
});
assert.deepEqual(commitManualCategory(selected, "school"), {
  activeCategory: "school", selectedProjectKey: null, navigationMode: "manual",
});
const pending = beginProgrammaticNavigation(selected, "personal", "personal-fullydancy");
assert.deepEqual(pending, {
  activeCategory: "school", selectedProjectKey: "school-apex", navigationMode: "programmatic",
});
assert.deepEqual(finishProgrammaticNavigation(pending, "personal", "personal-fullydancy"), {
  activeCategory: "personal", selectedProjectKey: "personal-fullydancy", navigationMode: "manual",
});
assert.deepEqual(finishProgrammaticNavigation(beginProgrammaticNavigation(initial, "internship"), "internship"), {
  activeCategory: "internship", selectedProjectKey: null, navigationMode: "manual",
});
assert.deepEqual(cancelProgrammaticNavigation(pending), {
  activeCategory: "school", selectedProjectKey: "school-apex", navigationMode: "manual",
});

assert.deepEqual(Object.keys(ISLAND_CONTENT).sort(), ["internship", "personal", "school"]);
assert.equal(ISLAND_CONTENT.school.projects.length, 3);
assert.equal(ISLAND_CONTENT.internship.projects.length, 4);
assert.equal(ISLAND_CONTENT.personal.projects.length, 3);
for (const content of Object.values(ISLAND_CONTENT)) {
  assert.ok(content.title && content.intro);
  content.projects.forEach(project => {
    assert.ok(project.key && project.title && project.summary);
  });
}
assert.ok(ISLAND_CONTENT.internship.projects.some(project => project.key === "internship-pollo-ai"));
assert.equal(PROJECT_CONTENT.get("internship-pollo-ai").role, "Agent 产品实习生");
assert.equal(PROJECT_CONTENT.get("internship-pollo-ai").period, "2026.06 – 2026.09");
assert.ok(PROJECT_CONTENT.get("internship-pollo-ai").results.some(result => result.includes("86.3%")));
assert.ok(PROJECT_CONTENT.get("internship-qianchuan").results.some(result => result.includes("53min")));
assert.ok(ISLAND_CONTENT.school.projects.some(project => project.key === "school-memora"));
assert.ok(ISLAND_CONTENT.personal.projects.some(project => project.key === "personal-comfyui"));

console.log("PASS: navigation state transitions and island content data");
