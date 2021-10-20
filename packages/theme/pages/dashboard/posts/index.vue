<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<h5 class="breadcrum-item">Posts</h5>
			</div>
		</header>

		<div>
			<post-item
				v-for="post in posts"
				:key="post.postId"
				:post="post"
				:dashboard="true"
			/>
			<client-only>
				<infinite-loading @infinite="getBoardPosts">
					<div slot="spinner" class="loader-container">
						<loader />
					</div>
					<div slot="no-more" />
					<div slot="no-results" />
					<div slot="error" />
				</infinite-loading>
			</client-only>
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";

// components
import PostItem from "../../../components/posts/PostItem.vue";
import Loader from "../../../components/ui/Loader.vue";

export default {
	name: "DashboardPosts",
	layout: "dashboard",
	components: {
		// packages
		InfiniteLoading,

		// components
		PostItem,
		Loader
	},
	data() {
		return {
			posts: [],
			page: 1
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	methods: {
		async getBoardPosts($state) {
			try {
				const userId = this.$store.getters["user/getUserId"];

				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/posts/get",
					data: {
						page: this.page,
						limit: null,
						created: "DESC",
						userId
					}
				});

				if (response.data.posts.length) {
					this.posts.push(...response.data.posts);
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
	head() {
		return {
			title: `Posts • Dashboard • ${this.settings.title}`
		};
	}
};
</script>
