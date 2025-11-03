import { ref } from "vue";
import { defineStore } from "pinia";
import type { IPost } from "@logchimp/types";

import type { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";
import { getPosts } from "../../modules/posts";

export const useDashboardPosts = defineStore("dashboardPosts", () => {
  const posts = ref<IPost[]>([]);
  const state = ref<InfiniteScrollStateType>();

  const isLoading = ref<boolean>(false);
  const page = ref<number>(1);
  const error = ref<unknown>(undefined);

  async function fetchPosts() {
    if (state.value === "LOADING" || state.value === "COMPLETED") {
      return;
    }

    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await getPosts({
        page: page.value.toString(),
        created: "DESC",
        boardId: [],
      });

      if (response.data.posts.length) {
        posts.value.push(...response.data.posts);
        page.value += 1;
        state.value = "LOADED";
      } else {
        state.value = "COMPLETED";
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      state.value = "ERROR";
      error.value = err;
    } finally {
      isLoading.value = false;
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

    if (posts.value[postIdx]) Object.assign(posts.value[postIdx], post);
  }

  function removePost(postId: string) {
    const postIdx = posts.value.findIndex((item) => item.postId === postId);
    if (postIdx === -1) return;

    posts.value.splice(postIdx, 1);
  }

  return {
    posts,
    state,

    fetchPosts,
    appendPost,
    updatePost,
    removePost,
  };
});
