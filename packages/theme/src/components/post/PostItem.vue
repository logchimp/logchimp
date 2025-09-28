<template>
  <div class="flex items-start mb-5 last:mb-0">
    <vote
      :post-id="postData.postId"
      :votes-count="postData.voters.votesCount"
      :is-voted="isVoted"
      @update-voters="updateVoters"
    />
    <div>
      <router-link
        data-test="post-link"
        :to="`${dashboardUrl}/posts/${postData.slug}`"
      >
        <div class="text-(--color-text-black) text-xl font-medium break-all">
          {{ postData.title }}
        </div>
      </router-link>
      <p
        v-if="postData.roadmap?.id"
        class="mt-1 uppercase font-medium text-sm break-all"
        :style="{
          color: `#${postData.roadmap.color}`
        }"
      >
        {{ postData.roadmap.name }}
      </p>
      <p
        v-if="postData.contentMarkdown"
        data-test="post-description"
        class="mt-2 text-(--color-gray-40)"
      >
        {{ useTrim(postData.contentMarkdown, 120) }}
      </p>
      <board-badge
        class="mt-2.5"
        v-if="postData.board?.boardId"
        :show-board="showBoard"
        :name="postData.board.name"
        :color="postData.board.color"
        :url="postData.board.url"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { IPostVote, IPost } from "@logchimp/types";

import { useTrim } from "../../hooks";

// components
import Vote from "../vote/Vote.vue";
import BoardBadge from "../board/BoardBadge.vue";

interface Props {
  post: IPost;
  dashboard?: boolean;
  showBoard?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  dashboard: false,
  showBoard: true,
});

const postData = ref(props.post);
const dashboardUrl = computed(() => (props.dashboard ? "/dashboard" : ""));
const isVoted = computed<boolean>(() =>
  Boolean(props.post.voters?.viewerVote?.voteId),
);

function updateVoters(voters: IPostVote) {
  postData.value.voters.votesCount = voters.votesCount;
  postData.value.voters.viewerVote = voters.viewerVote;
}
</script>
