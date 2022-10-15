<template>
  <div>
		<div v-infinite-scroll="getMorePosts">
			<post-item
				v-for="post in posts"
				:key="post.postId"
				:post="post"
				:show-board="false"
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

<script setup lang="ts">
// packages
import { onMounted, ref } from "vue";
import { vInfiniteScroll } from "@vueuse/components";

// modules
import { getPosts } from "../../modules/posts";

// components
// import ClientError from "../ui/ClientError.vue";
import PostItem from "../post/PostItem.vue";
// import Loader from "../Loader.vue";

const props = defineProps({
	board: {
		type: Object,
		default: () => {
			return {};
		}
	}
});

const posts = ref<any>([]);
const page = ref(1);

async function getMorePosts() {
	const boardId = props.board.boardId;

	try {
		const response = await getPosts({
			page: page.value,
			sort: "ASC",
			boardId: [boardId],
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

onMounted(() => getMorePosts())
</script>
