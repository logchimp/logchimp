<template>
  <div class="post">
    <vote
      :post-id="postData.postId"
      :votes-count="postData.voters.votesCount"
      :is-voted="postData.voters.viewerVote"
      @update-voters="updateVoters"
    />
    <div>
      <router-link
        class="post-content-link"
        data-test="post-link"
        :to="`${dashboardUrl}/posts/${postData.slug}`"
      >
        <h5 class="post-content-title">
          {{ postData.title }}
        </h5>
      </router-link>
      <p
        v-if="postData.roadmap"
        class="post-roadmap"
        :style="{
          color: `#${postData.roadmap.color}`
        }"
      >
        {{ postData.roadmap.name }}
      </p>
      <p data-test="post-description" class="post-content-description">
        {{ useTrim(postData.contentMarkdown, 120) }}
      </p>
      <board-badge
        v-if="postData.board"
        :show-board="showBoard"
        :name="postData.board.name"
        :color="postData.board.color"
        :url="postData.board.url"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, withDefaults } from "vue";

import { useTrim } from "../../hooks";

// components
import Vote, { VoteEventType } from "./Vote.vue";
import BoardBadge from "../board/BoardBadge.vue";

interface Props {
  post: any
  dashboard?: boolean
  showBoard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dashboard: false,
  showBoard: true,
})

const postData = ref(props.post);
const dashboardUrl = computed(() => props.dashboard ? "/dashboard" : "");

// TODO: Add TS types
function updateVoters(voters: VoteEventType) {
	postData.value.voters.votesCount = voters.votesCount;
	postData.value.voters.viewerVote = voters.viewerVote;
}
</script>
