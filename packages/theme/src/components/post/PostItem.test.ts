import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import { describe, it, expect } from "vitest";

import PostItem from "./PostItem.vue";

describe("post", () => {
  const wrapper = shallowMount(PostItem, {
    props: {
      post: {
        // random UUID
        postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
        title: "Post title",
        slug: "post-title-qwJy9_3Sm9g3Qm3r9OQk",
        contentMarkdown: "What's this feature is all about?",
        createdAt: new Date(),
        updatedAt: new Date(),
        voters: {
          votes: [],
          votesCount: 120,
        },
        author: {
          userId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
          name: "abc",
          avatar: "http://example.com/avatar.png",
          username: "abc",
        },
        board: {
          boardId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
          name: "Feature requests",
          color: "abcabc",
          url: "feature-requests",
          createdAt: new Date(),
        },
        roadmap: null,
      },
      showBoard: true,
    },
    stubs: {
      RouterLink: RouterLinkStub,
    },
  });

  it("link to post", () => {
    expect(wrapper.find("[data-test=post-link]").attributes("to")).toBe(
      "/posts/post-title-qwJy9_3Sm9g3Qm3r9OQk",
    );
  });

  it("title", () => {
    expect(wrapper.find("[data-test=post-link] h5").text()).toBe("Post title");
  });

  it("description", () => {
    expect(wrapper.find("[data-test=post-description]").text()).toBe(
      "What's this feature is all about?",
    );
  });
});
