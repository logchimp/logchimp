<template>
  <!-- Show roadmaps grid only when we have roadmaps -->
  <div
    v-if="roadmaps.length > 0" ref="roadmapElement"
    :class="[
      'overflow-x-auto h-[500px]',
      'grid grid-flow-col gap-x-4 md:gap-x-6 auto-cols-[minmax(22rem,24rem)]'
    ]"
  >
    <roadmap-column
      v-for="roadmap in roadmaps"
      :key="roadmap.id"
      :roadmap="roadmap"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted } from "vue";
import { useHead } from "@vueuse/head";
import { useInfiniteScroll } from "@vueuse/core";
import type { IPaginatedRoadmapsResponse, IRoadmap } from "@logchimp/types";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";
import { useSettingStore } from "../store/settings";

// components
import RoadmapColumn from "../ee/components/roadmap/RoadmapColumn.vue";

const { get: siteSettings } = useSettingStore();

// Cursor-based pagination state
const roadmapElement = useTemplateRef<HTMLElement>("roadmapElement");
const roadmaps = ref<IRoadmap[]>([]);
let roadmapList: IRoadmap[];
const roadmapIndex = ref<number>(0);

async function getRoadmaps() {
  try {
    const response = await getAllRoadmaps();

    const paginatedData: IPaginatedRoadmapsResponse = response.data;
    roadmapList = paginatedData.results;

    if (roadmapList.length > 0) {
      // Initializing the only 3 roadmaps
      for (; roadmapIndex.value < 3; ) {
        roadmaps.value.push(roadmapList[roadmapIndex.value++]);
      }
    }
  } catch (err) {
    console.error("Error fetching roadmaps:", err);
  }
}

useInfiniteScroll(
  roadmapElement,
  async () => {
    roadmaps.value.push(roadmapList[roadmapIndex.value++]);
  },
  {
    direction: "right",
    canLoadMore: () => {
      return roadmapIndex.value <= roadmapList.length;
    },
  },
);

useHead({
  title: "Roadmaps",
  meta: [
    {
      name: "og:title",
      content: () => `Roadmaps • ${siteSettings.title}`,
    },
  ],
});

onMounted(() => {
  getRoadmaps();
});

defineOptions({
  name: "Roadmaps",
});
</script>
