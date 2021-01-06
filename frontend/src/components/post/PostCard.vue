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
						<router-link data-test="post-link" :to="`/post/${post.slug}`">
							<h5>{{ post.title }}</h5>
						</router-link>
						<span
							data-test="post-board-name"
							v-if="!isExpanded"
							class="post-card-board"
							>{{ post.board.name }}</span
						>
						<time
							data-test="post-date"
							v-else
							:datetime="post.createdAt"
							:title="post.createdAt | moment('dddd, DD MMMM YYYY hh:mm')"
							class="post-date"
						>
							{{ post.createdAt | moment("from") }}
						</time>
					</div>
					<div
						data-test="post-card-toggle"
						@click="isExpanded = !isExpanded"
						:style="{
							transform: isExpanded ? 'rotateX(180deg)' : ''
						}"
						class="post-card-toggle"
					>
						<arrow-top />
					</div>
				</div>
				<p
					v-if="isExpanded"
					data-test="post-card-description"
					class="post-card-description"
				>
					{{ sliceContentMarkdown }}
				</p>
			</div>
		</div>
		<div data-test="post-card-extra" v-if="isExpanded" class="post-card-extra">
			<avatar-stack
				:avatars="post.voters.votes"
				:totalCount="post.voters.votesCount"
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
// components
import Vote from "./Vote";
import BoardBadge from "../board/BoardBadge";
import AvatarStack from "../AvatarStack";

// icons
import ArrowTop from "../icons/ArrowTop";

export default {
	name: "PostCard",
	data() {
		return {
			postData: this.post,
			isExpanded: false
		};
	},
	props: {
		post: {
			type: Object,
			required: true
		}
	},
	components: {
		Vote,
		BoardBadge,
		ArrowTop,
		AvatarStack
	},
	computed: {
		sliceContentMarkdown() {
			return (
				this.post.contentMarkdown.slice(0, 120) +
				(this.post.contentMarkdown.length > 120 ? "..." : "")
			);
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
