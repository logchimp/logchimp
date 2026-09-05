<template>
  <div>
    <post-item
      v-for="post in posts"
      :key="post.postId"
      :post="post"
      :show-board="false"
    />

    <infinite-scroll :on-infinite="getMorePosts" :state="state" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { IPost } from "@logchimp/types";

// modules
import { Posts } from "../../modules/posts";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../components/ui/InfiniteScroll.vue";
import PostItem from "../post/PostItem.vue";

const props = defineProps({
  board: {
    type: Object,
    default: () => {},
  },
});

const posts = ref<IPost[]>([]);
const endCursor = ref<string | undefined>();
const hasNextPage = ref<boolean>(false);
const state = ref<InfiniteScrollStateType>();

async function getMorePosts() {
  if (state.value === "LOADING" || state.value === "COMPLETED") return;
  const boardId = props.board.boardId;
  state.value = "LOADING";

  const postsAPI = new Posts();

  try {
    const response = await postsAPI.GetPosts(
      {
        boardId: [boardId],
      },
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
    console.error(error);
    state.value = "ERROR";
  }
}
</script>
