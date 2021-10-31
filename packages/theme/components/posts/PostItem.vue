<template>
	<div class="post">
		<vote
			:post-id="postData.postId"
			:votes-count="postData.voters.votesCount"
			:is-voted="postData.voters.viewerVote"
			@update-voters="updateVoters"
		/>
		<div>
			<a
				class="post-content-link"
				data-test="post-link"
				:href="`${dashboardUrl}/posts/${postData.slug}`"
			>
				<h5 class="post-content-title">
					{{ postData.title }}
				</h5>
			</a>
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
				{{ post.contentMarkdown | trim(120) }}
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

<script>
// components
import Vote from "../vote/Vote.vue";
import BoardBadge from "../board/BoardBadge.vue";

export default {
	name: "PostItem",
	components: {
		// components
		Vote,
		BoardBadge
	},
	props: {
		post: {
			type: Object,
			required: true,
			default: () => {}
		},
		dashboard: {
			type: Boolean,
			default: false
		},
		showBoard: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			postData: this.post
		};
	},
	computed: {
		dashboardUrl() {
			return this.dashboard ? "/dashboard" : "";
		}
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
