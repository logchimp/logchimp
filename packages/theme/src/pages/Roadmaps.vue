<template>
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

const roadmapElement = useTemplateRef<HTMLElement>("roadmapElement");
const roadmaps = ref<IRoadmap[]>([]);
const endCursor = ref<string | undefined>();
const hasNextPage = ref<boolean>(false);

async function getRoadmaps(after: string | undefined) {
  try {
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
  }
}

useInfiniteScroll(
  roadmapElement,
  async () => {
    getRoadmaps(endCursor.value);
  },
  {
    direction: "right",
    canLoadMore: () => {
      return hasNextPage.value;
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
  getRoadmaps(undefined);
});

defineOptions({
  name: "Roadmaps",
});
</script>
