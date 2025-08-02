<template>
  <!-- Show roadmaps grid only when we have roadmaps -->
  <div
    v-if="roadmaps.length > 0"
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

  <!-- Show infinite scroll component with proper conditions -->
  <infinite-scroll
    @infinite="getRoadmaps"
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

<script lang="ts">
export default {
  name: "Roadmaps",
};
</script>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";
import { useSettingStore } from "../store/settings"

// components
import InfiniteScroll, { type InfiniteScrollStateType } from "../components/ui/InfiniteScroll.vue";
import RoadmapColumn from "../ee/components/roadmap/RoadmapColumn.vue";

//  Import types from centralized location
import type {
  Roadmap,
  PaginatedRoadmapsResponse
} from "../type/src"; // or "../types/src" depending on your structure

// Remove these local interface definitions
// interface Roadmap { ... }
// interface PaginationResponse { ... }

const { get: siteSettings } = useSettingStore();

// Cursor-based pagination state
const roadmaps = ref<Roadmap[]>([]);
const currentCursor = ref<string | null>(null);
const pageSize = ref<number>(20);
const hasNextPage = ref<boolean>(true);
const state = ref<InfiniteScrollStateType>();

async function getRoadmaps() {
  // Don't fetch if we've reached the end
  if (!hasNextPage.value) {
    state.value = "COMPLETED";
    return;
  }

  state.value = "LOADING";

  try {
    //  The response is now AxiosResponse<PaginatedRoadmapsResponse>
    const response = await getAllRoadmaps({
      first: pageSize.value,
      after: currentCursor.value
    });

    //  Access .data to get the actual PaginatedRoadmapsResponse
    const paginatedData: PaginatedRoadmapsResponse = response.data;
    const newRoadmaps = paginatedData.data; // The actual roadmaps array

    if (newRoadmaps.length > 0) {
      // Filter out duplicates based on ID (safety measure)
      const existingIds = new Set(roadmaps.value.map(r => r.id));
      const uniqueNewRoadmaps = newRoadmaps.filter(r => !existingIds.has(r.id));

      roadmaps.value.push(...uniqueNewRoadmaps);

      // Update cursor to the last item's ID for next page
      const lastRoadmap = newRoadmaps[newRoadmaps.length - 1];
      currentCursor.value = lastRoadmap.id;

      //  Access pagination info from the correct location
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

// Reset and fetch initial data
function resetAndFetch() {
  roadmaps.value = [];
  currentCursor.value = null;
  hasNextPage.value = true;
  getRoadmaps();
}

// Fetch initial data on component mount
onMounted(() => {
  resetAndFetch();
});

useHead({
  title: "Roadmaps",
  meta: [
    {
      name: "og:title",
      content: () => `Roadmaps • ${siteSettings.title}`
    }
  ]
});
</script>
