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
						<a data-test="post-link" :href="`/posts/${post.slug}`">
							<h5>{{ post.title }}</h5>
						</a>
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
							:title="$dayjs(post.createdAt).format('dddd, DD MMMM YYYY hh:mm')"
							class="post-date"
						>
							{{ $dayjs(post.createdAt).from() }}
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
					{{ post.contentMarkdown | trim(120) }}
				</p>
			</div>
		</div>
		<div v-if="isExpanded" data-test="post-card-extra" class="post-card-extra">
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

<script>
// pacakges
import { ChevronUp as ArrowTopIcon } from "lucide-vue";

// components
import Vote from "../vote/Vote.vue";
import BoardBadge from "../board/BoardBadge";
import AvatarStack from "../ui/AvatarStack.vue";

export default {
	name: "PostCard",
	components: {
		Vote,
		BoardBadge,
		AvatarStack,

		// icons
		ArrowTopIcon
	},
	props: {
		post: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			postData: this.post,
			isExpanded: false
		};
	},
	methods: {
		updateVoters(voters) {
			this.postData.voters.votesCount = voters.votesCount;
			this.postData.voters.viewerVote = voters.viewerVote;
		}
	},
	filters: {
		/**
		 * Filter to trim text
		 *
		 * @param {string} value
		 * @param {number} size
		 * @param {string} trail
		 */
		trim: function (value, size, trail) {
			if (!value) return "";
			const valueLength = value.length;

			value = value.slice(0, size);
			return value.trim() + (valueLength > size ? trail : "");
		}
	}
};
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
