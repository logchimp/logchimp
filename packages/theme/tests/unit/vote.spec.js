import Vuex from "vuex";
import Vote from "../../src/components/post/Vote";
import { createLocalVue, mount } from "@vue/test-utils";

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {
      // random UUID
      userId: "d33e4e05-9c8b-4255-9838-b59085d081a0"
    },
    permissions: ["vote:create", "vote:destroy"]
  },
  getters: {
    "user/getUserId": state => state.user.userId,
    "user/getPermissions": state => state.permissions
  },
  mutations: {
    updateUser(state, payload) {
      state.user = payload;
    },
    updatePermissions(state, payload) {
      state.permissions = payload;
    }
  }
});

const wrapper = mount(Vote, {
  store,
  localVue,
  propsData: {
    // random UUID
    postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311"
  }
});

describe("vote", () => {
  it("Enable vote with 'vote:create' permission", () => {
    expect(
      wrapper.find("[data-test=vote]").classes("post-voters-disabled")
    ).toBe(false);
  });

  it("Vote is voted", async () => {
    await wrapper.setProps({
      isVoted: true
    });

    expect(
      wrapper.find("[data-test=vote-arrow]").classes("post-voters-vote")
    ).toBe(true);
  });

  it("Vote is not voted", async () => {
    await wrapper.setProps({
      isVoted: false
    });

    expect(
      wrapper.find("[data-test=vote-arrow]").classes("post-voters-vote")
    ).toBe(false);
  });

  it("Vote count is '120' votes", async () => {
    await wrapper.setProps({
      votesCount: 120
    });

    expect(wrapper.find("[data-test=vote-count]").text()).toBe("120");
  });

  it("disable without 'vote:create' permission", async () => {
    await store.commit("updatePermissions", []);

    expect(
      wrapper.find("[data-test=vote]").classes("post-voters-disabled")
    ).toBe(true);
  });

  it("enabled with user logged out", async () => {
    await store.commit("updateUser", {});

    expect(
      wrapper.find("[data-test=vote]").classes("post-voters-disabled")
    ).toBe(false);
  });
});
