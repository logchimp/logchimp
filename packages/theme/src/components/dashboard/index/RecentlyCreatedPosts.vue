<script setup lang="ts">
import { ref } from "vue";
import type { IPost } from "@logchimp/types";

import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../../components/ui/InfiniteScroll.vue";
import Table from "../../../components/ui/Table/Table.vue";
import Tr from "../../../components/ui/Table/Tr.vue";
import Td from "../../../components/ui/Table/Td.vue";

import { Posts } from "../../../modules/posts.ts";

const posts = ref<IPost[]>([]);
const postState = ref<InfiniteScrollStateType>("IDLE");

async function getRecentPosts() {
  postState.value = "LOADING";

  const postsAPI = new Posts();

  try {
    const response = await postsAPI.GetPosts(
      {},
      {
        first: "4",
        created: "DESC",
      },
    );

    posts.value = response.posts;
    postState.value = "COMPLETED";
  } catch (error) {
    console.error(error);
    postState.value = "ERROR";
  }
}
</script>

<template>
  <Table>
    <template #header>
      <Td
        :head="true"
        :style="{
              width: '200px',
            }"
        class="flex-1 break-all"
      >
        Title
      </Td>
      <Td :head="true">
        Votes
      </Td>
    </template>

    <Tr
      v-for="post in posts"
      :key="post.postId"
    >
      <div class="relative flex items-center">
        <Td
          :style="{
                width: '200px',
              }"
          class="flex-1 line-clamp-1 truncate hover:line-clamp-none hover:break-all hover:whitespace-normal"
        >
          {{ post.title }}
        </Td>
        <Td>
          {{ post.voters.votesCount }}
        </Td>
        <router-link
          :to="`/dashboard/posts/${encodeURIComponent(post.slug)}`"
          class="absolute inset-0"
        />
      </div>
    </Tr>

    <template #infinite-loader>
      <infinite-scroll :on-infinite="getRecentPosts" :state="postState" />
    </template>
  </Table>
</template>
