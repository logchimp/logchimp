<template>
  <!-- Show roadmaps grid only when we have roadmaps -->
  <div
    v-if="roadmaps.length > 0"
    :class="[
      'overflow-x-auto h-[500px]',
      'grid grid-flow-col gap-x-4 md:gap-x-6 auto-cols-[minmax(22rem,24rem)]'
    ]"
    ref="scrollContainer"
  >
    <roadmap-column
      v-for="roadmap in roadmaps"
      :key="roadmap.id"
      :roadmap="roadmap"
    />
      <div v-if="roadmapArr.length != roadmapCount" ref="target"></div>
  </div>

  <!-- Show infinite scroll component with proper conditions -->
  <infinite-scroll
    :on-infinite="getRoadmaps"
    :state="state"
    :has-items="roadmaps.length > 0"
  >
    <template #no-results>
      <!-- Only show "no roadmaps" when we truly have no data -->
      <div v-if="roadmaps.length === 0 && state === 'COMPLETED'">
        <p>There are no roadmaps.</p>
      </div>
    </template>

    <!-- Optional: Add loading indicator -->
    <template #loading>
      <div v-if="state === 'LOADING'">
        <p>Loading roadmaps...</p>
      </div>
    </template>
  </infinite-scroll>
</template>

<script setup lang="ts">
import { ref, onUpdated } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";
import { useSettingStore } from "../store/settings";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../components/ui/InfiniteScroll.vue";
import RoadmapColumn from "../ee/components/roadmap/RoadmapColumn.vue";

import type { IPaginatedRoadmapsResponse, IRoadmap } from "@logchimp/types";

const { get: siteSettings } = useSettingStore();

// Cursor-based pagination state
const roadmapArr = ref<IRoadmap[]>([]);
const roadmaps = ref<IRoadmap[]>([]);
const currentCursor = ref<string | undefined>();
const hasNextPage = ref<boolean>(false);
const state = ref<InfiniteScrollStateType>();
const roadmapCount = ref<int>(0);
const scrollContainer = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
const target = ref<HTMLElement | null>(null);

async function getRoadmaps() {
  if (state.value === "COMPLETED") return;

  state.value = "LOADING";

  try {
    const response = await getAllRoadmaps({
      after: currentCursor.value,
    });

    const paginatedData: IPaginatedRoadmapsResponse = response.data;
    roadmapArr.value = paginatedData.results;

    if (roadmapArr.value.length > 0) {
      // fetch only the first 3 roadmap posts
      for (
        roadmapCount.value = 0;
        roadmapCount.value < Math.min(roadmapArr.value.length, 3);
      ) {
        roadmaps.value.push(roadmapArr.value[roadmapCount.value++]);
      }

      // Use backend-provided cursor
      currentCursor.value = paginatedData.page_info.end_cursor || undefined;
      hasNextPage.value = paginatedData.page_info.has_next_page;

      state.value = hasNextPage.value ? "LOADED" : "COMPLETED";
    } else {
      state.value = "COMPLETED";
      hasNextPage.value = false;
    }
  } catch (err) {
    console.error("Error fetching roadmaps:", err);
    state.value = "ERROR";
  }
}

useHead({
  title: "Roadmaps",
  meta: [
    {
      name: "og:title",
      content: () => `Roadmaps • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "Roadmaps",
});

onUpdated(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        if (roadmapCount.value < roadmapArr.value.length) {
          roadmaps.value.push(roadmapArr.value[roadmapCount.value++]);
          console.log("@31");
        }
      }
    },
    {
      root: scrollContainer.value,
      threshold: 0.05,
    },
  );
  if (target.value) observer.observe(target.value);
});
</script>
