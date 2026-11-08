import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import type { components } from "@logchimp/api-ts-types";
import { type AxiosError, isCancel } from "axios";

import type { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";
import { PostsAPI } from "../../modules/posts";

const postsAPI = new PostsAPI();

export const useDashboardPosts = defineStore("dashboardPosts", () => {
  const posts = ref<components["schemas"]["Post"][]>([]);
  const state = ref<InfiniteScrollStateType>("IDLE");

  const searchQuery = ref<string | undefined>();
  const endCursor = ref<string | null>(null);
  const hasNextPage = ref<boolean>(false);
  const errorCode = ref<unknown>(undefined);

  let abortController: AbortController | null = null;

  async function fetchPosts() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    abortController?.abort();
    abortController = new AbortController();

    state.value = "LOADING";
    errorCode.value = undefined;

    try {
      const response = await postsAPI.GetPosts(
        {
          query: searchQuery.value,
        },
        {
          after: endCursor.value ?? undefined,
          created: "DESC",
        },
        {
          signal: abortController.signal,
        },
      );

      if (abortController.signal.aborted) return;

      if (response.results.length > 0) {
        posts.value.push(...response.results);
      }

      if ("page_info" in response) {
        endCursor.value = response.page_info.end_cursor;
        hasNextPage.value = response.page_info.has_next_page;
      }

      if (hasNextPage.value) {
        state.value = "LOADED";
      } else {
        state.value = "COMPLETED";
      }
    } catch (error) {
      const err = error as AxiosError<
        components["schemas"]["GenericAPIErrorResponseBody"]
      >;

      // axios request canceled
      if (isCancel(err) || err.code === "ERR_CANCELED") return;

      state.value = "ERROR";

      // HTTP API error handling
      switch (err.response?.data?.code) {
        case "LICENSE_VALIDATION_FAILED":
        case "LICENSE_INSUFFICIENT_TIER":
          errorCode.value = err.response.data.code;
      }
    }
  }

  function appendPost(post: components["schemas"]["Post"]) {
    posts.value.unshift(post);
  }

  function updatePost(post: components["schemas"]["Post"]) {
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

  const debounceFetchPosts = useDebounceFn(async () => {
    endCursor.value = null;
    hasNextPage.value = false;
    errorCode.value = undefined;
    posts.value = [];

    await fetchPosts();
  }, 800);

  watch(
    () => searchQuery.value,
    async (newValue, oldValue) => {
      if (newValue === oldValue) return;
      abortController?.abort();
      state.value = "IDLE";

      await debounceFetchPosts();
    },
  );

  return {
    posts,
    state,
    searchQuery,
    error: errorCode,

    fetchPosts,
    appendPost,
    updatePost,
    removePost,
  };
});
