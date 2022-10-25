// import dayjs from "dayjs";
import { RouterLinkStub, shallowMount } from "@vue/test-utils";

import RoadmapPostCard from "./RoadmapPostCard.vue";

describe("post card", () => {
  const wrapper = shallowMount(RoadmapPostCard, {
    props: {
      post: {
        // random UUID
        postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
        title: "Post title",
        // random slug ID
        slug: "post-title-qwJy9_3Sm9g3Qm3r9OQk",
        contentMarkdown: "What's this feature is all about?",
        // random createdAt date
        createdAt: "2020-12-19T09:50:10.137Z",
        voters: {
          isVoted: true,
          votesCount: 120,
          votes: [
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
              username: "peter",
            },
          ],
        },
        board: {
          name: "Feature requests",
          color: "abcabc",
          url: "feature-requests",
          showBoard: true,
        },
      },
    },
    stubs: {
      Vote: true,
      RouterLink: RouterLinkStub,
      AvatarStack: true,
      BoardBadge: true,
    },
  });

  it("link to post", () => {
    expect(wrapper.find("[data-test=post-link]").attributes("to")).toBe(
      "/posts/post-title-qwJy9_3Sm9g3Qm3r9OQk",
    );
  });

  it("post board name", () => {
    expect(wrapper.find("[data-test=post-board-name]").text()).toBe(
      "Feature requests",
    );
  });

  it("post card extra is not shown", () => {
    expect(wrapper.find("[data-test=post-card-extra]").exists()).toBe(false);
  });

  describe("post card expanded", () => {
    it("Expand post card", async () => {
      await wrapper.find("[data-test=post-card-toggle]").trigger("click");

      expect(
        wrapper.find("[data-test=post-card-toggle]").attributes("style"),
      ).toBe("transform: rotateX(180deg);");
    });

    it("Board name should not be visible", () => {
      expect(wrapper.find("[data-test=post-board-name]").exists()).toBe(false);
    });

    it("Relative post createdAt date", () => {
      expect(wrapper.find("[data-test=post-date]").text()).toContain("ago");
    });

    // todo: showing different time on CI (in UTC timezone)
    // it("Post createdAt full date", () => {
    // 	expect(wrapper.find("[data-test=post-date]").attributes("title")).toBe(
    // 		"Saturday, 19 December 2020 03:20"
    // 	);
    // });

    it("post description", () => {
      expect(wrapper.find("[data-test=post-card-description]").text()).toBe(
        "What's this feature is all about?",
      );
    });

    it("post card extra is shown", () => {
      expect(wrapper.find("[data-test=post-card-extra]").exists()).toBe(true);
    });
  });
});
