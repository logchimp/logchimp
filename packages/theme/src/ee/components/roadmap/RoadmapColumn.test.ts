import { createPinia } from "pinia";
import { shallowMount } from "@vue/test-utils";

import RoadmapColumn from "./RoadmapColumn.vue";

describe("roadmap view", () => {
  const wrapper = shallowMount(RoadmapColumn, {
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
    expect(
      wrapper.find("[data-test=roadmap-header] .color-dot").attributes("style"),
    ).toBe("background-color: rgb(221, 116, 121);");
  });

  it("has title 'Planned'", () => {
    expect(wrapper.find("[data-test=roadmap-header] h6").text()).toBe(
      "Planned",
    );
  });

  it("roadmap column exists", () => {
    expect(wrapper.find("[data-test=roadmap-column]").exists()).toBe(true);
  });
});
