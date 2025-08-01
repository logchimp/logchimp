<template>
	<div>
		<header class="form-header">
			<breadcrumbs>
				<h5 class="breadcrum-item">Posts</h5>
			</breadcrumbs>
		</header>

    <post-item
      v-for="post in posts"
      :key="post.postId"
      :post="post"
      :dashboard="true"
    />

    <infinite-scroll @infinite="getBoardPosts" :state="state" />
	</div>
</template>

<script lang="ts">
export default {
  name: "DashboardPosts",
};
</script>

<script setup lang="ts">
// packages
import { ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { getPosts } from "../../../modules/posts";

// components
import InfiniteScroll, { type InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue"
import PostItem from "../../../components/post/PostItem.vue";
import Loader from "../../../components/ui/Loader.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";

// TODO: Add TS types
const posts = ref<unknown>([])
const page = ref<number>(1);

const state = ref<InfiniteScrollStateType>()

async function getBoardPosts() {
  state.value = "LOADING"

	try {
		const response = await getPosts({
			page: page.value,
			sort: "DESC"
		});

		if (response.data.posts.length) {
			posts.value.push(...response.data.posts);
			page.value += 1;
			state.value = "LOADED"
		} else {
			state.value = "COMPLETED"
		}
	} catch (error) {
		console.error(error);
		state.value = "ERROR"
	}
}

useHead({
	title: "Posts • Dashboard"
})
</script>
