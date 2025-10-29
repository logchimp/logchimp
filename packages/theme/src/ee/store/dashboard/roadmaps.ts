import { ref } from "vue";
import { defineStore } from "pinia";
import { LexoRank } from "lexorank";

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
    if (state.value === "LOADING" || state.value === "COMPLETED") {
      return;
    }

    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await getAllRoadmaps({
        after: currentCursor.value,
        visibility: ["public", "private"],
      });

      const results = response.data.results;
      const pageInfo = response.data.page_info;

      if (results.length > 0) {
        const sortedResults = results.sort(
          (a: IRoadmapPrivate, b: IRoadmapPrivate) => {
            const aRank = a.index || `0|${String(a.index).padStart(6, "0")}:`;
            const bRank = b.index || `0|${String(b.index).padStart(6, "0")}:`;
            return aRank.localeCompare(bRank);
          },
        );
        roadmaps.value.push(...sortedResults);

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
    if (roadmaps.value.length === 0) {
      roadmap.index = LexoRank.middle().toString();
    } else {
      const lastRoadmap = roadmaps.value[roadmaps.value.length - 1];
      const lastIndex = lastRoadmap.index
        ? LexoRank.parse(lastRoadmap.index)
        : LexoRank.middle();
      roadmap.index = lastIndex.genNext().toString();
    }
    roadmaps.value.push(roadmap);
  }

  function updateRoadmap(roadmap: IRoadmapPrivate) {
    const roadmapIdx = roadmaps.value.findIndex(
      (item: IRoadmapPrivate) => item.id === roadmap.id,
    );
    if (roadmapIdx === -1) return;

    Object.assign(roadmaps.value[roadmapIdx], roadmap);
  }

  function updateRoadmapIndex(roadmapId: string, roadmapRankIndex: string) {
    const roadmap = roadmaps.value.find(
      (item: IRoadmapPrivate) => item.id === roadmapId,
    );
    if (!roadmap) return;

    roadmap.index = roadmapRankIndex;

    return roadmap.index;
  }

  function removeRoadmap(roadmapId: string) {
    const roadmapIdx = roadmaps.value.findIndex(
      (item: IRoadmapPrivate) => item.id === roadmapId,
    );
    if (roadmapIdx === -1) return;

    roadmaps.value.splice(roadmapIdx, 1);
  }

  function sortRoadmap(roadmapId: string, newIndex: string) {
    const roadmap = roadmaps.value.find(
      (roadmap: IRoadmapPrivate) => roadmap.id === roadmapId,
    );
    if (!roadmap) return;

    roadmap.index = newIndex;

    roadmaps.value.sort((a: IRoadmapPrivate, b: IRoadmapPrivate) => {
      const aRank = a.index || `0|${String(a.index || 0).padStart(6, "0")}:`;
      const bRank = b.index || `0|${String(b.index || 0).padStart(6, "0")}:`;
      return aRank.localeCompare(bRank);
    });
  }

  return {
    roadmaps,
    state,

    fetchRoadmaps,
    appendRoadmap,
    updateRoadmap,
    removeRoadmap,
    sortRoadmap,
    updateRoadmapIndex,
  };
});
