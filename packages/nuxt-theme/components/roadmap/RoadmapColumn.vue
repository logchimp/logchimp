<template>
	<div>
		<header data-test="roadmap-header" class="roadmap-header">
			<div
				class="color-dot"
				:style="{
					backgroundColor: `#${roadmap.color}`
				}"
			/>
			<h6>{{ roadmap.name }}</h6>
		</header>
		<div data-test="roadmap-column" class="roadmap-column">
			<roadmap-post-card
				v-for="post in posts"
				:key="post.postId"
				:post="post"
			/>
		</div>
	</div>
</template>

<script>
// components
import RoadmapPostCard from "./RoadmapPostCard.vue";

export default {
	name: "RoadmapColumn",
	components: {
		// components
		RoadmapPostCard
	},
	props: {
		roadmap: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			posts: []
		};
	},
	created() {
		this.getRoadmapPosts();
	},
	methods: {
		async getRoadmapPosts() {
			const roadmapId = this.roadmap.id;
			try {
				const userId = this.$store.getters["user/getUserId"];

				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/posts/get",
					data: {
						page: 1,
						limit: 20,
						created: "DESC",
						userId,
						roadmapId
					}
				});

				this.posts = response.data.posts;
			} catch (err) {
				console.error(err);
			}
		}
	}
};
</script>

<style lang='sass'>
.roadmap-header
	display: flex
	align-items: center
	margin-bottom: 0.625rem

	.color-dot
		margin-right: 0.375rem

	h6
		font-weight: 400
		font-size: 0.875rem
		margin-bottom: 0
		color: var(--color-gray-60)

.roadmap-column
	border-radius: var(--border-radius-default)
	background-color: var(--color-gray-95)
	padding: 0.75rem
</style>
