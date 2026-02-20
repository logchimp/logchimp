<template>
  <roadmap-skeleton v-if="loading" />
  <div
    v-else-if="errorCode === 'LICENSE_VALIDATION_FAILED'"
    class="text-center"
  >
    <p>
      No roadmaps available
    </p>
  </div>
  <template v-else>
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
        <LoaderContainer />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted } from "vue";
import { useHead } from "@vueuse/head";
import { useInfiniteScroll } from "@vueuse/core";
import type {
  IApiErrorResponse,
  IPaginatedRoadmapsResponse,
  IRoadmap,
} from "@logchimp/types";
import type { AxiosError } from "axios";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";
import { useSettingStore } from "../store/settings";

// components
import RoadmapColumn from "../ee/components/roadmap/RoadmapColumn.vue";
import RoadmapSkeleton from "../ee/components/roadmap/RoadmapSkeleton.vue";
import LoaderContainer from "../components/ui/LoaderContainer.vue";

const { get: siteSettings } = useSettingStore();

const roadmapElement = useTemplateRef<HTMLElement>("roadmapElement");
const roadmaps = ref<IRoadmap[]>([]);
const endCursor = ref<string | undefined>();
const hasNextPage = ref<boolean>(false);
const errorCode = ref<string>();
const loading = ref(true);
const scrollLoading = ref(false);

async function getRoadmaps(after: string | undefined, isScroll = false) {
  if (isScroll) scrollLoading.value = true;
  else loading.value = true;

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
  } catch (error) {
    const err = error as AxiosError<IApiErrorResponse>;
    if (err.response?.data.code === "LICENSE_VALIDATION_FAILED") {
      errorCode.value = err.response.data.code;
    }
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
