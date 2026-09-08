<script setup lang="ts">
import { ref } from "vue";
import type { IApiErrorResponse, IPost } from "@logchimp/types";
import type { AxiosError } from "axios";
import { KeyIcon } from "lucide-vue";

import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../../components/ui/InfiniteScroll.vue";
import Table from "../../../components/ui/Table/Table.vue";
import Tr from "../../../components/ui/Table/Tr.vue";
import Td from "../../../components/ui/Table/Td.vue";

import { Posts } from "../../../modules/posts.ts";

const posts = ref<IPost[]>([]);
const state = ref<InfiniteScrollStateType>("IDLE");
const errorCode = ref<string | null>(null);

async function getRecentPosts() {
  if (state.value === "LOADING" || state.value === "COMPLETED") return;
  state.value = "LOADING";

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
    state.value = "COMPLETED";
  } catch (error) {
    const err = error as AxiosError<IApiErrorResponse>;
    state.value = "ERROR";

    if (err.response?.data?.code === "LICENSE_VALIDATION_FAILED") {
      errorCode.value = err.response.data.code;
    }
  }
}
</script>

<template>
  <div
    v-if="errorCode === 'LICENSE_VALIDATION_FAILED'"
    class="border border-dashed border-red-300/80 rounded-lg p-4 text-center flex flex-col items-center gap-y-2.5"
  >
    <KeyIcon class="stroke-red-600" />
    <p class="mb-1 font-medium">License issue</p>
    <span
      class="text-neutral-600 text-sm"
    >
      We are unable to display posts due to a license validation failure.
    </span>
  </div>
  <Table
    v-else
  >
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
      <infinite-scroll :on-infinite="getRecentPosts" :state="state" />
    </template>
  </Table>
</template>
