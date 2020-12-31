<template>
	<div class="post">
		<Vote
			:post-id="postData.postId"
			:votes-count="postData.voters.votesCount"
			:is-voted="postData.voters.viewerVote"
			@update-voters="updateVoters"
		/>
		<div>
			<router-link
				class="post-content-link"
				data-test="post-link"
				:to="`${dashboardUrl}/post/${postData.slug}`"
			>
				<h5 class="post-content-title">
					{{ postData.title }}
				</h5>
			</router-link>
			<p
				data-test="post-description"
				class="post-content-description"
				v-html="sliceContentMarkdown"
			/>
			<board-badge
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
import Vote from "./Vote";
import BoardBadge from "../board/BoardBadge";

export default {
	name: "post",
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
	components: {
		Vote,
		BoardBadge
	},
	computed: {
		sliceContentMarkdown() {
			return (
				this.post.contentMarkdown.slice(0, 120) +
				(this.post.contentMarkdown.length > 120 ? "..." : "")
			);
		},
		dashboardUrl() {
			return this.dashboard ? "/dashboard" : "";
		}
	},
	methods: {
		updateVoters(voters) {
			this.postData.voters.votesCount = voters.votesCount;
			this.postData.voters.viewerVote = voters.viewerVote;
		}
	}
};
</script>
