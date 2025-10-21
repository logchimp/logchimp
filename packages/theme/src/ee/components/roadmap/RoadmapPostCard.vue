<template>
  <div class="post-card">
    <div class="post-card-main">
      <Vote
        :post-id="post.postId"
        :votes-count="post.voters.votesCount"
        :is-voted="isVoted"
        @update-voters="updateVoters"
      />
      <div style="width: 100%">
        <div class="post-card-section">
          <div>
            <router-link data-test="post-link" :to="`/posts/${post.slug}`">
              <h5>{{ post.title }}</h5>
            </router-link>
            <span
              v-if="!isExpanded && post.board"
              data-test="post-board-name"
              class="post-card-board"
            >
              {{ post.board.name }}
            </span>
            <time
              v-else
              data-test="post-date"
							:title="dayjs(post.createdAt).format('dddd, DD MMMM YYYY hh:mm')"
              class="post-date"
            >
              {{ dayjs(post.createdAt).fromNow() }}
					</time>
          </div>
          <div
            data-test="post-card-toggle"
            :style="{
              transform: isExpanded ? 'rotateX(180deg)' : ''
            }"
            class="post-card-toggle"
            @click="isExpanded = !isExpanded"
          >
            <arrow-top-icon />
          </div>
        </div>
        <p
          v-if="isExpanded && post.contentMarkdown"
          data-test="post-card-description"
          class="post-card-description"
        >
          {{ useTrim(post.contentMarkdown || "", 120) }}
        </p>
      </div>
    </div>
    <div
      v-if="isExpanded"
      data-test="post-card-extra"
      class="flex items-center justify-between p-3 border-t border-(--color-gray-95) overflow-hidden"
    >
      <avatar-stack
        :avatars="post.voters.votes"
        :total-count="post.voters.votesCount"
      />
      <board-badge
        v-if="post.board"
        :show-board="true"
        :name="post.board.name"
        :color="post.board.color"
        :url="post.board.url"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronUp as ArrowTopIcon } from "lucide-vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { IPost, IPostVote } from "@logchimp/types";

import { useTrim } from "../../../hooks";

// components
import Vote from "../../../components/vote/Vote.vue";
import BoardBadge from "../../../components/board/BoardBadge.vue";
import { AvatarStack } from "../../../components/ui/Avatar";

dayjs.extend(relativeTime);

interface Props {
  post: IPost;
}

const props = defineProps<Props>();

const isExpanded = ref(false);
const postData = ref(props.post);
const isVoted = computed<boolean>(() =>
  Boolean(props.post.voters?.viewerVote?.voteId),
);

function updateVoters(voters: IPostVote) {
  postData.value.voters.votesCount = voters.votesCount;
  postData.value.voters.viewerVote = voters.viewerVote;
}
</script>

<style lang='sass'>
.post-card
	background-color: var(--color-white)
	margin-bottom: 0.75rem
	border-radius: var(--border-radius-default)

	&:last-child
		margin-bottom: 0

.post-card-main
	padding: 0.75rem
	display: flex
	align-items: self-start

	h5
		color: var(--color-text-black)
		margin-bottom: 0.125em

.post-card-board
	text-transform: uppercase
	font-size: 0.875rem
	font-weight: 500
	color: var(--color-gray-70)

.post-card-section
	display: flex
	align-items: center
	width: 100%

.post-card-toggle
	margin-left: auto
	padding: 0.125rem
	cursor: pointer
	background-color: var(--color-gray-95)
	user-select: none
	border-radius: 1rem

	svg
		display: block
		stroke: var(--color-gray-60)

.post-card-description
	color: var(--color-gray-40)
	font-size: 0.875rem
	margin-top: 0.5rem
</style>
