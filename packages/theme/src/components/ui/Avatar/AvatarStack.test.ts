import { mount } from "@vue/test-utils";

import AvatarStack from "./AvatarStack.vue";

describe("avatar stack", () => {
  const wrapper = mount(AvatarStack, {
    props: {
      avatars: [
        {
          // random UUID
          userId: "01982803-d099-4f03-8607-471f87d7c6e9",
          avatar: "https://www.gravatar.com/avatar/1",
          username: "peg-legge",
        },
        {
          // random UUID
          userId: "e1de47b3-7acb-4024-9635-1c7ebffc07c3",
          avatar: "https://www.gravatar.com/avatar/2",
          username: "baka",
        },
        {
          // random UUID
          userId: "0f3fd2a0-7d96-4b65-95b5-bf79bccda2c5",
          avatar: "https://www.gravatar.com/avatar/3",
          username: "kimiko",
        },
        {
          // random UUID
          userId: "71c3dea6-c848-4bba-85b4-d1766e461308",
          avatar: "https://www.gravatar.com/avatar/4",
          username: "neha",
        },
      ],
      totalCount: 123,
    },
  });

  it("number of images rendered", () => {
    const images = wrapper.findAll("[data-test=avatar-stack-image]");

    expect(images).toHaveLength(4);
  });

  it("render first avatar from avatars props", () => {
    const images = wrapper.findAll("[data-test=avatar-stack-image]");

    expect(images.at(0)?.attributes("src")).toBe(
      "https://www.gravatar.com/avatar/1",
    );

    expect(images.at(0)?.attributes("alt")).toBe("peg-legge");
  });

  describe("avatar stack more", () => {
    it("count should be '117'", () => {
      expect(wrapper.find("[data-test=avatar-stack-more]").text()).toBe("+117");
    });

    it("hide on count is <= 6", async () => {
      await wrapper.setProps({
        totalCount: 6,
      });

      expect(wrapper.find("[data-test=avatar-stack-more]").exists()).toBe(
        false,
      );
    });
  });
});
