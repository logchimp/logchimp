import { ref } from "vue";
import { defineStore } from "pinia";
import type { IRoadmapPrivate } from "@logchimp/types";

import { getAllRoadmaps } from "../../../modules/roadmaps";
import type { InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue";

export const useDashboardRoadmaps = defineStore("dashboardRoadmaps", () => {
  const roadmaps = ref<IRoadmapPrivate[]>([]);
  const state = ref<InfiniteScrollStateType>();

  const hasNextPage = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const error = ref<unknown>(undefined);

  const currentCursor = ref<string>();

  async function fetchRoadmaps() {
    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await getAllRoadmaps({
        after: currentCursor.value,
      });

      const results = response.data.results;
      const pageInfo = response.data.page_info;

      if (results.length > 0) {
        roadmaps.value.push(...results);

        currentCursor.value = pageInfo.end_cursor || undefined;
        hasNextPage.value = pageInfo.has_next_page;

        state.value = hasNextPage.value ? "LOADED" : "COMPLETED";
      } else {
        state.value = "COMPLETED";
        hasNextPage.value = false;
      }
    } catch (err) {
      console.error("Error fetching roadmaps:", err);
      state.value = "ERROR";
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  function appendRoadmap(roadmap: IRoadmapPrivate) {
    roadmaps.value.unshift(roadmap);
  }

  function updateRoadmap(roadmap: IRoadmapPrivate) {
    const roadmapIdx = roadmaps.value.findIndex(
      (item) => item.id === roadmap.id,
    );
    if (roadmapIdx === -1) return;

    Object.assign(roadmaps.value[roadmapIdx], roadmap);
  }

  function removeRoadmap(roadmapId: string) {
    const roadmapIdx = roadmaps.value.findIndex(
      (item) => item.id === roadmapId,
    );
    if (roadmapIdx === -1) return;

    roadmaps.value.splice(roadmapIdx, 1);
  }

  return {
    roadmaps,
    state,

    fetchRoadmaps,
    appendRoadmap,
    updateRoadmap,
    removeRoadmap,
  };
});
