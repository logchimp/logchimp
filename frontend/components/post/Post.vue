<template>
	<div class="post">
		<Vote
			:post-id="post.postId"
			:voters="post.voters"
			@update-voters="updateVoters"
		/>
		<div class="post-content">
			<nuxt-link
				class="post-content-link"
				:to="`${dashboardUrl}/post/${post.slug}`"
			>
				<h5 class="post-content-title">{{ post.title }}</h5>
			</nuxt-link>
			<p class="post-content-description" v-html="sliceContentMarkdown" />
			<nuxt-link
				:to="`${dashboardUrl}/board/${post.board.url}`"
				v-if="post.board"
			>
				<div class="post-board">
					<div
						class="board-color"
						:style="{
							backgroundColor: `#${post.board.color}`
						}"
					/>
					<div class="post-board-name">
						<p>{{ post.board.name }}</p>
					</div>
				</div>
			</nuxt-link>
		</div>
	</div>
</template>

<script>
// components
import Vote from "@/components/post/Vote";

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
		}
	},
	components: {
		Vote
	},
	computed: {
		sliceContentMarkdown() {
			if (this.post.contentMarkdown) {
				return (
					this.post.contentMarkdown.slice(0, 120) +
					(this.post.contentMarkdown.length > 120 ? "..." : "")
				);
			} else {
				return "";
			}
		},
		dashboardUrl() {
			return this.dashboard ? "/dashboard" : "";
		}
	},
	methods: {
		updateVoters(voters) {
			// eslint-disable-next-line vue/no-mutating-props
			this.post.voters = voters;
		}
	}
};
</script>
