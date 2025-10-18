<template>
   <!-- Show skeleton while loading -->
  <roadmap-skeleton v-if="loading" />

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

    <div
      v-if="scrollLoading"
      class="flex items-center justify-center"
    >
      <roadmap-skeleton />
    </div>
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
import RoadmapSkeleton from "../ee/components/roadmap/RoadmapSkeleton.vue";

const { get: siteSettings } = useSettingStore();

const roadmapElement = useTemplateRef<HTMLElement>("roadmapElement");
const roadmaps = ref<IRoadmap[]>([]);
const endCursor = ref<string | undefined>();
const hasNextPage = ref<boolean>(false);

const loading = ref(true); // for initial load
const scrollLoading = ref(false); // for infinite scroll load

async function getRoadmaps(after: string | undefined, isScroll = false) {
  try {
    if (isScroll) scrollLoading.value = true;
    else loading.value = true;

    const response = await getAllRoadmaps({
      first: "4",
      after: after == null ? undefined : after,
      visibility: ["public"],
    });

    const paginatedData: IPaginatedRoadmapsResponse = response.data;
    const roadmapList = paginatedData.results;

    if (roadmapList.length > 0) {
      roadmaps.value.push(...roadmapList);
    }
    endCursor.value = paginatedData.page_info.end_cursor || undefined;
    hasNextPage.value = paginatedData.page_info.has_next_page;
  } catch (err) {
    console.error("Error fetching roadmaps:", err);
  } finally {
    loading.value = false;
    scrollLoading.value = false;
  }
}

useInfiniteScroll(
  roadmapElement,
  async () => {
    getRoadmaps(endCursor.value, true);
  },
  {
    direction: "right",
    canLoadMore: () => hasNextPage.value && !scrollLoading.value,
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
  getRoadmaps(undefined);
});

defineOptions({
  name: "Roadmaps",
});
</script>
