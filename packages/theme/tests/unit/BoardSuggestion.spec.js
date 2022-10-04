import BoardSuggestion from "../../src/components/board/BoardSuggestion";
import { mount } from "@vue/test-utils";

describe("board badge", () => {
  const wrapper = mount(BoardSuggestion, {
    propsData: {
      board: {
        name: "Feature requests",
        color: "abcabc",
        url: "feature-requests"
      }
    }
  });

  it("color is 'rgb(171, 202, 188)'", () => {
    expect(
      wrapper.find("[data-test=board-suggestion-color]").attributes("style")
    ).toBe("background-color: rgb(171, 202, 188);");
  });

  it("name is 'Feature requests'", () => {
    expect(wrapper.find("[data-test=board-suggestion-name]").text()).toBe(
      "Feature requests"
    );
  });

  it("name is 'feature-requests'", () => {
    expect(wrapper.find("[data-test=board-suggestion-url]").text()).toBe(
      "feature-requests"
    );
  });
});
