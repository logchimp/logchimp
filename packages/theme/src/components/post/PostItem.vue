<template>
  <div class="post">
    <vote
      :post-id="postData.postId"
      :votes-count="postData.voters.votesCount"
      :is-voted="isVoted"
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
        v-if="postData.roadmap?.id"
        class="post-roadmap"
        :style="{
          color: `#${postData.roadmap.color}`
        }"
      >
        {{ postData.roadmap.name }}
      </p>
      <p v-if="postData.contentMarkdown" data-test="post-description" class="post-content-description">
        {{ useTrim(postData.contentMarkdown, 120) }}
      </p>
      <board-badge
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

<style lang='sass'>
.post
	display: flex
	align-items: flex-start
	margin-bottom: 1.25rem

	&:last-child
		margin-bottom: 0

.post-content-link
	text-decoration: none

.post-content-title
	color: var(--color-text-black)
	margin-bottom: 0

.post-roadmap
	text-transform: uppercase
	font-weight: 500
	font-size: 0.875rem
	margin-top: 0.25rem

.post-content-description
	margin-top: 0.5rem
	color: var(--color-gray-40)
	margin-bottom: 0.625rem

.post-date
	color: var(--color-gray-70)
	font-size: 0.875rem
</style>
