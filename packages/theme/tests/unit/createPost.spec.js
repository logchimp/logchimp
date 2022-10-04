import Vuex from "vuex";
import CreatePost from "../../src/components/post/CreatePost";
import { createLocalVue, mount } from "@vue/test-utils";

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  state: {
    permissions: ["post:create"]
  },
  getters: {
    "user/getPermissions": state => state.permissions
  },
  mutations: {
    updatePermissions(state, payload) {
      state.permissions = payload.permissions;
    }
  }
});

describe("create post", () => {
  const wrapper = mount(CreatePost, {
    store,
    localVue,
    propsData: {
      // random UUID
      boardId: "8efd997b-28d6-41cd-8fd5-f7f1407497f8"
    },
    stubs: ["LTextarea"]
  });

  it("show error message on empty title", async () => {
    await wrapper.find("[data-test=create-post-button]").trigger("click");

    expect(
      wrapper
        .find("[data-test=post-title] [data-test=input-error-message]")
        .text()
    ).toBe("You forgot to enter a post title");
  });

  it("Disable create post button by removing 'post:create' permission", async () => {
    // remove permission from local vuex store
    await wrapper.vm.$store.commit("updatePermissions", {
      permissions: []
    });

    expect(
      wrapper
        .find("[data-test=create-post-button")
        .classes("button-primary-disabled")
    ).toBe(true);
  });
});
