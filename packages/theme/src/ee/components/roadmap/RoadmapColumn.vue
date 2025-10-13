<template>
  <div class="flex flex-col gap-2.5 h-full min-h-0">
    <header data-test="roadmap-header" class="flex items-center gap-x-1.5">
      <color-dot :color="roadmap.color" />
      <div data-test="roadmap-name" class="text-sm text-(--color-gray-60)">{{ roadmap.name }}</div>
    </header>
    <div data-test="roadmap-column" class="rounded-md bg-(--color-gray-95) p-3 flex-grow min-h-0 overflow-y-auto">
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
import type { IPost } from "@logchimp/types";

// modules
import { getPosts } from "../../../modules/posts";

// components
import RoadmapPostCard from "./RoadmapPostCard.vue";
import ColorDot from "../../../components/ui/ColorDot/ColorDot.vue";

const props = defineProps({
  roadmap: {
    type: Object,
    required: true,
  },
});

const posts = ref<IPost[]>([]);

async function getRoadmapPosts() {
  const roadmapId = props.roadmap.id;
  try {
    const response = await getPosts({
      page: "1",
      limit: "20",
      created: "DESC",
      boardId: [],
      roadmapId,
    });

    posts.value = response.data.posts;
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => getRoadmapPosts());
</script>

