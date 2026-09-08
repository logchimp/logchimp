import { ref } from "vue";
import { defineStore } from "pinia";
import type { IApiErrorResponse, IPost } from "@logchimp/types";

import type { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";
import { Posts } from "../../modules/posts";
import type { AxiosError } from "axios";

export const useDashboardPosts = defineStore("dashboardPosts", () => {
  const posts = ref<IPost[]>([]);
  const state = ref<InfiniteScrollStateType>("IDLE");

  const endCursor = ref<string | undefined>();
  const hasNextPage = ref<boolean>(false);
  const errorCode = ref<unknown>(undefined);

  async function fetchPosts() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    state.value = "LOADING";
    errorCode.value = undefined;

    const postsAPI = new Posts();

    try {
      const response = await postsAPI.GetPosts(
        {},
        {
          after: endCursor.value,
          created: "DESC",
        },
      );

      const postsList = response.posts;

      if (postsList.length > 0) {
        posts.value.push(...response.posts);
      }

      endCursor.value = response.page_info?.end_cursor || undefined;
      hasNextPage.value = response.page_info?.has_next_page || false;

      if (hasNextPage.value) {
        state.value = "LOADED";
      } else {
        state.value = "COMPLETED";
      }
    } catch (error) {
      const err = error as AxiosError<IApiErrorResponse>;
      state.value = "ERROR";

      if (err.response?.data?.code === "LICENSE_VALIDATION_FAILED") {
        errorCode.value = err.response.data.code;
      }
    }
  }

  function appendPost(post: IPost) {
    posts.value.unshift(post);
  }

  function updatePost(post: IPost) {
    const postIdx = posts.value.findIndex(
      (item) => item.postId === post.postId,
    );
    if (postIdx === -1) return;
    if (!posts.value[postIdx]) return;

    Object.assign(posts.value[postIdx], post);
  }

  function removePost(postId: string) {
    const postIdx = posts.value.findIndex((item) => item.postId === postId);
    if (postIdx === -1) return;

    posts.value.splice(postIdx, 1);
  }

  return {
    posts,
    state,
    error: errorCode,

    fetchPosts,
    appendPost,
    updatePost,
    removePost,
  };
});
