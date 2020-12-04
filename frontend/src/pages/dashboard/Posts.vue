<template>
	<div>
		<div class="boards-page-header">
			<h4 class="boards-page-header-heading">Posts</h4>
		</div>

		<div>
			<post
				v-for="post in posts"
				:post="post"
				:key="post.postId"
				:dashboard="true"
			/>
			<infinite-loading @infinite="getBoardPosts">
				<div class="loader-container" slot="spinner"><loader /></div>
				<div slot="no-more"></div>
				<div slot="no-results"></div>
				<div slot="error"></div>
			</infinite-loading>
		</div>
	</div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getPosts } from "../../modules/posts";

// components
import Post from "../../components/post/Post";
import Loader from "../../components/Loader";

export default {
	name: "DashboardPosts",
	data() {
		return {
			posts: [],
			page: 1
		};
	},
	components: {
		// packages
		InfiniteLoading,

		// components
		Post,
		Loader
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		async getBoardPosts($state) {
			const userId = this.$store.getters["user/getUserId"];

			try {
				const response = await getPosts(this.page, null, "desc", userId);

				if (response.data.length) {
					this.posts.push(...response.data);
					this.page += 1;
					$state.loaded();
				} else {
					$state.complete();
				}
			} catch (error) {
				console.error(error);
				$state.error();
			}
		}
	},
	metaInfo() {
		return {
			title: "Posts · Dashboard",
			meta: [
				{
					name: "og:title",
					content: `Posts · Dashboard · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
