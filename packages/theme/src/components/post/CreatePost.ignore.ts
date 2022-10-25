import { createPinia } from "pinia";
import { mount, RouterLinkStub } from "@vue/test-utils";

import { useUserStore } from "../../store/user";
import CreatePost from "./CreatePost.vue";

describe("create post", () => {
  const wrapper = mount(CreatePost, {
    global: {
      plugins: [createPinia()],
    },
    props: {
      // random UUID
      boardId: "8efd997b-28d6-41cd-8fd5-f7f1407497f8",
    },
    stubs: {
      RouterLink: RouterLinkStub,
    },
  });

  const userStore = useUserStore();

  describe("have 'post:create' permission", () => {
    userStore.setPermissions(["post:create"]);

    it("should not have CTA button disabled", () => {
      expect(
        wrapper
          .find('[data-test="create-post-button"]')
          .classes("button-primary-disabled"),
      ).toBe(false);
    });

    it("show error message on empty title", async () => {
      await wrapper.find("[data-test=create-post-button]").trigger("click");

      expect(
        wrapper
          .find("[data-test=post-title] [data-test=input-error-message]")
          .exists(),
      ).toBeTruthy();
    });
  });

  it("Disable create post button by removing 'post:create' permission", () => {
    userStore.setPermissions([]);
    console.log(wrapper.find('[data-test="create-post-button"]').html());
    expect(
      wrapper
        .find('[data-test="create-post-button"]')
        .classes("button-primary-disabled"),
    ).toBe(true);
  });
});
