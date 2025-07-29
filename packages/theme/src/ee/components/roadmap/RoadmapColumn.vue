<template>
  <div class="flex flex-col gap-2.5">
    <header data-test="roadmap-header" class="flex items-center gap-x-1.5">
      <div
        class="color-dot"
        :style="{
          backgroundColor: `#${roadmap.color}`
        }"
      />
      <div data-test="roadmap-name" class="text-sm text-(--color-gray-60)">{{ roadmap.name }}</div>
    </header>
    <div data-test="roadmap-column" class="rounded-md bg-(--color-gray-95) p-3 flex-grow">
      <roadmap-post-card
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
import { getPosts } from "../../../modules/posts";

// components
import RoadmapPostCard from "./RoadmapPostCard.vue";

const props = defineProps({
  roadmap: {
    type: Object,
    required: true,
  },
});

// TODO: Add TS types
const posts = ref<unknown[]>([]);

async function getRoadmapPosts() {
  const roadmapId = props.roadmap.id;
  try {
    const response = await getPosts({
      page: 1,
      limit: 20,
      sort: "DESC",
      roadmapId,
    });

    posts.value = response.data.posts;
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => getRoadmapPosts());
</script>

