import { mount, RouterLinkStub } from "@vue/test-utils";

import BoardItem from "./BoardItem.vue";

describe("board item", () => {
  const wrapper = mount(BoardItem, {
    props: {
      name: "Feature requests",
      color: "abcabc",
      url: "feature-requests",
      postCount: 30,
    },
    stubs: {
      RouterLink: RouterLinkStub,
    },
  });

  it("link to '/feature-requests' board", () => {
    expect(wrapper.find("[data-test=board-item]").attributes("to")).toBe(
      "/boards/feature-requests",
    );
  });

  it("color is 'rgb(171, 202, 188)'", () => {
    expect(
      wrapper.find("[data-test=board-item-color]").attributes("style"),
    ).toBe("background-color: rgb(171, 202, 188);");
  });

  it("name is 'Feature requests'", () => {
    expect(wrapper.find("[data-test=board-item-name]").text()).toBe(
      "Feature requests",
    );
  });

  it("post count is '30'", () => {
    expect(wrapper.find("[data-test=board-item-postcount]").text()).toBe("30");
  });
});
