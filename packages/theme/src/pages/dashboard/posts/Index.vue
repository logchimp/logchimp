<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<h5 class="breadcrum-item">Posts</h5>
			</div>
		</header>

		<div v-infinite-scroll="getBoardPosts">
			<post-item
				v-for="post in posts"
				:key="post.postId"
				:post="post"
				:dashboard="true"
			/>
			<!-- <div slot="spinner" class="loader-container">
				<loader />
			</div>
			<div slot="no-more" />
			<div slot="no-results" />
			<client-error slot="error">
				Something went wrong!
			</client-error> -->
		</div>
	</div>
</template>

<script lang="ts">
export default {
	name: "DashboardPosts",
}
</script>

<script setup lang="ts">
// packages
import { onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";
import { vInfiniteScroll } from "@vueuse/components";

// modules
import { getPosts } from "../../../modules/posts";

// components
import PostItem from "../../../components/posts/PostItem.vue";
import Loader from "../../../components/ui/Loader.vue";
// import ClientError from "../../../components/ui/ClientError.vue";

const posts = ref<any>([])
const page = ref(1);

async function getBoardPosts() {
	try {
		const response = await getPosts({
			page: page.value,
			sort: "DESC"
		});

		if (response.data.posts.length) {
			posts.value.push(...response.data.posts);
			page.value += 1;
			// $state.loaded();
		} else {
			// $state.complete();
		}
	} catch (error) {
		console.error(error);
		// $state.error();
	}
}

onMounted(() => getBoardPosts())

useHead({
	title: "Posts • Dashboard"
})
</script>
