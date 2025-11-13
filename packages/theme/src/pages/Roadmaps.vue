<template>
  <roadmap-skeleton v-if="isLoadingSkeleton" />

  <!-- Show roadmaps grid only when we have roadmaps -->
  <div
    v-if="roadmaps.length > 0"
    ref="roadmapElement"
    :class="[
      'overflow-x-auto h-[500px] overflow-y-hidden',
      'grid grid-flow-col gap-x-4 md:gap-x-6 auto-cols-[minmax(22rem,24rem)]',
    ]"
  >
    <roadmap-column
      v-for="roadmap in roadmaps"
      :key="roadmap.id"
      :roadmap="roadmap"
    />
  </div>
  <infinite-scroll
    :on-infinite="getRoadmaps"
    :state="state"
    direction="right"
    :target="roadmapElement"
  />
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useHead } from "@vueuse/head";
import type { IPaginatedRoadmapsResponse, IRoadmap } from "@logchimp/types";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";
import { useSettingStore } from "../store/settings";

// components
import RoadmapColumn from "../ee/components/roadmap/RoadmapColumn.vue";
import RoadmapSkeleton from "../ee/components/roadmap/RoadmapSkeleton.vue";
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../components/ui/InfiniteScroll.vue";

const { get: siteSettings } = useSettingStore();

const roadmapElement = useTemplateRef<HTMLElement>("roadmapElement");
const roadmaps = ref<IRoadmap[]>([]);
const endCursor = ref<string | undefined>();
const hasNextPage = ref<boolean>(false);

const state = ref<InfiniteScrollStateType>();
const isLoadingSkeleton = ref(true);

async function getRoadmaps() {
  if (state.value === "LOADING" || state.value === "COMPLETED") return;

  state.value = "LOADING";
  const first = 4;

  try {
    const response = await getAllRoadmaps({
      first: first.toString(),
      after: endCursor.value,
      visibility: ["public"],
    });

    const paginatedData: IPaginatedRoadmapsResponse = response.data;
    const roadmapList = paginatedData.results;
    endCursor.value = paginatedData.page_info.end_cursor || undefined;
    hasNextPage.value = paginatedData.page_info.has_next_page;
    if (roadmapList.length) {
      roadmaps.value.push(...roadmapList);
      state.value = "LOADED";
    }
    if (!hasNextPage.value) {
      state.value = "COMPLETED";
    }
  } catch (err) {
    console.error("Error fetching roadmaps:", err);
    state.value = "ERROR";
  } finally {
    isLoadingSkeleton.value = false;
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
</script>
