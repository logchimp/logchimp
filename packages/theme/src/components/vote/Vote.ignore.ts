import { createPinia } from "pinia";
import { mount } from "@vue/test-utils";

import { useUserStore } from "../../store/user";
import Vote from "./Vote.vue";

describe("vote", () => {
  const wrapper = mount(Vote, {
    global: {
      plugins: [createPinia()],
    },
    props: {
      // random UUID
      postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
    },
  });

  const userStore = useUserStore();

  /**
   * Scaffold data to User store
   */
  userStore.setUser({
    // random UUID
    userId: "d33e4e05-9c8b-4255-9838-b59085d081a0",
  });
  userStore.setPermissions(["vote:create"]);

  it("'[data-test=vote]' should exists", () => {
    expect(wrapper.find("[data-test=vote]").exists()).toBeTruthy();
  });

  it("Enable vote with 'vote:create' permission", () => {
    // const userStore = useUserStore()

    console.log(userStore.permissions);

    expect(
      wrapper.find("[data-test=vote]").classes("post-voters-disabled"),
    ).toBe(false);
  });

  it("Vote is voted", async () => {
    await wrapper.setProps({
      isVoted: true,
    });

    expect(
      wrapper.find("[data-test=vote-arrow]").classes("post-voters-vote"),
    ).toBe(true);
  });

  it("Vote is not voted", async () => {
    await wrapper.setProps({
      isVoted: false,
    });

    expect(
      wrapper.find("[data-test=vote-arrow]").classes("post-voters-vote"),
    ).toBe(false);
  });

  it("Is voted", async () => {
    await wrapper.setProps({
      isVoted: true,
    });

    expect(
      wrapper.find("[data-test=vote-arrow]").classes("post-voters-vote"),
    ).toBe(true);
  });

  it("Vote count is '120' votes", async () => {
    await wrapper.setProps({
      votesCount: 120,
    });

    expect(wrapper.find("[data-test=vote-count]").text()).toBe("120");
  });

  it("disable without 'vote:create' permission", async () => {
    const userStore = useUserStore();
    userStore.setPermissions([]);

    // console.log(wrapper.find("[data-test=vote]").classes())

    expect(wrapper.find("[data-test=vote]").classes()).toContain(
      "post-voters-disabled",
    );
  });

  it("enabled with user logged out", async () => {
    const userStore = useUserStore();
    userStore.setUser({});

    expect(
      wrapper.find("[data-test=vote]").classes("post-voters-disabled"),
    ).toBe(false);
  });
});
