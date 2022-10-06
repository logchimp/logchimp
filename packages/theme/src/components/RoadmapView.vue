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
      <post-card
        v-for="post in posts"
        :key="post.postId"
        :post="post"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

// modules
import { getPosts } from "../modules/posts";

// components
import PostCard from "../components/post/PostCard.vue";

const props = defineProps({
	roadmap: {
		type: Object,
		required: true
	}
})

// TODO: Add TS types
const posts = ref<any>([]);

async function getRoadmapPosts() {
	const roadmapId = props.roadmap.id;
	try {
		const response = await getPosts({
			page: 1,
			limit: 20,
			sort: "DESC",
			roadmapId
		});

		posts.value = response.data.posts;
	} catch (err) {
		console.error(err);
	}
}

onMounted(() => getRoadmapPosts())
</script>
