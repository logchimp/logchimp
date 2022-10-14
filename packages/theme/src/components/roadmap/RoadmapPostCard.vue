<template>
  <div class="post-card">
    <div class="post-card-main">
      <Vote
        :post-id="post.postId"
        :votes-count="post.voters.votesCount"
        :is-voted="post.voters.viewerVote"
        @update-voters="updateVoters"
      />
      <div style="width: 100%">
        <div class="post-card-section">
          <div>
            <router-link data-test="post-link" :to="`/posts/${post.slug}`">
              <h5>{{ post.title }}</h5>
            </router-link>
            <span
              v-if="!isExpanded"
              data-test="post-board-name"
              class="post-card-board"
            >
              {{ post.board.name }}
            </span>
            <time
              v-else
              data-test="post-date"
              :datetime="post.createdAt"
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
          v-if="isExpanded"
          data-test="post-card-description"
          class="post-card-description"
        >
          {{ useTrim(post.contentMarkdown, 120) }}
        </p>
      </div>
    </div>
    <div
      v-if="isExpanded"
      data-test="post-card-extra"
      class="post-card-extra"
    >
      <avatar-stack
        :avatars="post.voters.votes"
        :total-count="post.voters.votesCount"
      />
      <board-badge
        :show-board="true"
        :name="post.board.name"
        :color="post.board.color"
        :url="post.board.url"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// pacakges
import { ref } from "vue";
import { ChevronUp as ArrowTopIcon } from "lucide-vue";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import { useTrim } from "../../hooks";

// components
import Vote, { VoteEventType } from "../vote/Vote.vue";
import BoardBadge from "../board/BoardBadge.vue";
import { AvatarStack }from "../ui/Avatar";

dayjs.extend(relativeTime);

const props = defineProps({
	post: {
		type: Object,
		required: true
	}
})

const isExpanded = ref(false);
const postData = ref(props.post);

function updateVoters(voters: VoteEventType) {
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

.post-card-extra
	padding: 0.75rem
	border-top: 1px solid var(--color-gray-95)
	display: flex
	align-items: center

	.board-badge
		margin-left: auto
</style>
