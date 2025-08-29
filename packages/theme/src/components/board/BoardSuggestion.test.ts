import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

import BoardSuggestion from "./BoardSuggestion.vue";

describe("board badge", () => {
  const wrapper = mount(BoardSuggestion, {
    props: {
      board: {
        name: "Feature requests",
        color: "abcabc",
        url: "feature-requests",
        display: true,
        post_count: "0",
        boardId: "test-board-id",
        createdAt: new Date(),
        view_voters: true,
      },
    },
  });

  it("color is 'rgb(171, 202, 188)'", () => {
    expect(wrapper.find("[data-test=color-dot]").attributes("style")).toBe(
      "background-color: rgb(171, 202, 188);",
    );
  });

  it("name is 'Feature requests'", () => {
    expect(wrapper.find("[data-test=board-suggestion-name]").text()).toBe(
      "Feature requests",
    );
  });

  it("name is 'feature-requests'", () => {
    expect(wrapper.find("[data-test=board-suggestion-url]").text()).toBe(
      "feature-requests",
    );
  });
});
