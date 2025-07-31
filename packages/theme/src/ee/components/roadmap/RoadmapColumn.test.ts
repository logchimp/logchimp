import { describe, it, expect } from "vitest";
import { createPinia } from "pinia";
import { mount } from "@vue/test-utils";

import RoadmapColumn from "./RoadmapColumn.vue";

describe("roadmap view", () => {
  const wrapper = mount(RoadmapColumn, {
    global: {
      plugins: [createPinia()],
    },
    props: {
      roadmap: {
        // random UUID
        id: "b474072b-9e8e-41c1-8bd7-a10f52bf8650",
        name: "Planned",
        color: "dd7479",
      },
    },
    stubs: ["PostCard"],
  });

  it("has color dot", () => {
    const colorDot = wrapper.find(
      "[data-test=roadmap-header] [data-test=color-dot]",
    );
    expect(colorDot.exists()).toBeTruthy();
    expect(colorDot.attributes("style")).toBe(
      "background-color: rgb(221, 116, 121);",
    );
  });

  it("has title 'Planned'", () => {
    const roadmapName = wrapper.find(
      "[data-test=roadmap-header] [data-test=roadmap-name]",
    );
    expect(roadmapName.exists()).toBeTruthy();
    expect(roadmapName.text()).toBe("Planned");
  });

  it("roadmap column exists", () => {
    expect(wrapper.find("[data-test=roadmap-column]").exists()).toBe(true);
  });
});
