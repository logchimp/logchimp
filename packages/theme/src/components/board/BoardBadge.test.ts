import { mount, RouterLinkStub } from "@vue/test-utils";

import BoardBadge from "./BoardBadge.vue";

describe("board badge", () => {
  const wrapper = mount(BoardBadge, {
    props: {
      name: "Feature requests",
      color: "abcabc",
      url: "feature-requests",
      showBoard: true,
    },
    stubs: {
      RouterLink: RouterLinkStub,
    },
  });

  it("color is 'rgb(171, 202, 188)'", () => {
    expect(
      wrapper.find("[data-test=board-badge-color]").attributes("style"),
    ).toBe("background-color: rgb(171, 202, 188);");
  });

  it("name is 'Feature requests'", () => {
    expect(wrapper.find("[data-test=board-badge-name]").text()).toBe(
      "Feature requests",
    );
  });

  it("link to '/feature-requests' board", () => {
    const component = wrapper.getComponent(BoardBadge);
    expect(component.find("[data-test=board-badge]").attributes("to")).toBe(
      "/boards/feature-requests",
    );
  });
});
