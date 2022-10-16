<template>
  <div>
    <post-item
      v-for="post in posts"
      :key="post.postId"
      :post="post"
      :show-board="false"
    />

    <infinite-scroll @infinite="getMorePosts" :state="state" />
  </div>
</template>

<script setup lang="ts">
// packages
import { ref } from "vue";

// modules
import { getPosts } from "../../modules/posts";

// components
import InfiniteScroll, { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";
import PostItem from "../post/PostItem.vue";

const props = defineProps({
	board: {
		type: Object,
		default: () => {}
	}
});

const posts = ref<any>([]);
const page = ref<number>(1);
const state = ref<InfiniteScrollStateType>()

async function getMorePosts() {
	const boardId = props.board.boardId;
  state.value = 'LOADING'

	try {
		const response = await getPosts({
			page: page.value,
			sort: "DESC",
			boardId: [boardId],
		});

		if (response.data.posts.length) {
			posts.value.push(...response.data.posts);
			page.value += 1;
			state.value = "LOADED"
		} else {
			state.value = "COMPLETED";
		}
	} catch (error) {
		console.error(error);
		state.value = "ERROR"
	}
}
</script>
