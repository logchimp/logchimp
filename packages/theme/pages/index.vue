<template>
	<div class="homepage">
		<main class="homepage-posts">
			<post-item v-for="post in posts" :key="post.postId" :post="post" />
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
		</main>
		<aside class="homepage-sidebar">
			<site-setup-card v-if="!setup.is_setup" />
			<login-card v-if="!isAuthenticated && setup.is_setup" />
		</aside>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";

// components
import PostItem from "../components/posts/PostItem.vue";
import Loader from "../components/ui/Loader.vue";
import SiteSetupCard from "../components/site/SiteSetupCard.vue";
import LoginCard from "../components/auth/LoginCard.vue";

export default {
	name: "Homepage",
	layout: "viewer",
	components: {
		// packages
		InfiniteLoading,

		// components
		PostItem,
		Loader,
		SiteSetupCard,
		LoginCard
	},
	data() {
		return {
			posts: [],
			page: 1
		};
	},
	async asyncData({ $axios }) {
		const setup = await $axios.$get("/api/v1/auth/setup");

		return { setup };
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		isAuthenticated() {
			const user = this.$store.getters["user/getUserId"];
			return !!user;
		}
	},
	methods: {
		async getBoardPosts($state) {
			const userId = this.$store.getters["user/getUserId"];

			try {
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
			title: this.settings.title,
			meta: [
				{
					name: "og:title",
					content: this.settings.title
				}
			]
		};
	}
};
</script>

<style lang='sass'>
.homepage
	display: flex
	margin-bottom: 4rem

@media (max-width: 990px)
	.homepage
		flex-direction: column-reverse

	.homepage-sidebar
		margin-bottom: 1.5rem

@media (min-width: 992px)
	.homepage-posts
		flex: 2
		margin-right: 2rem

	.homepage-sidebar
		flex: 1
		margin-left: 2rem
</style>
