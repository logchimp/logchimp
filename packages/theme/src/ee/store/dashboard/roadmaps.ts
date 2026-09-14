import { ref } from "vue";
import { defineStore } from "pinia";
import type { IApiErrorResponse, IRoadmapPrivate } from "@logchimp/types";
import { type AxiosError, isCancel } from "axios";

import { getAllRoadmaps } from "../../modules/roadmaps";
import type { InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue";

export const useDashboardRoadmaps = defineStore("dashboardRoadmaps", () => {
  const roadmaps = ref<IRoadmapPrivate[]>([]);
  const state = ref<InfiniteScrollStateType>("IDLE");

  const hasNextPage = ref<boolean>(false);
  const errorCode = ref<unknown>(undefined);

  const currentCursor = ref<string>();
  let abortController: AbortController | null = null;

  async function fetchRoadmaps() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    abortController?.abort();
    abortController = new AbortController();

    state.value = "LOADING";
    errorCode.value = undefined;

    try {
      const response = await getAllRoadmaps(
        {
          after: currentCursor.value,
          visibility: ["public", "private"],
        },
        {
          signal: abortController.signal,
        },
      );

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
    } catch (error) {
      const err = error as AxiosError<IApiErrorResponse>;

      // axios request canceled
      if (isCancel(err) || err.code === "ERR_CANCELED") return;

      state.value = "ERROR";

      if (err.response?.status === 404) {
        errorCode.value = "LICENSE_INSUFFICIENT_TIER";
        return;
      }

      // HTTP API error handling
      switch (err.response?.data?.code) {
        case "LICENSE_VALIDATION_FAILED":
        case "LICENSE_INSUFFICIENT_TIER":
          errorCode.value = err.response.data.code;
          return;
      }
    }
  }

  function appendRoadmap(roadmap: IRoadmapPrivate) {
    const existingIdx = roadmaps.value.findIndex(
      (item) => item.id === roadmap.id,
    );
    if (existingIdx !== -1) {
      Object.assign(roadmaps.value[existingIdx], roadmap);
    } else {
      roadmaps.value.push(roadmap);
    }
  }

  function updateRoadmap(roadmap: IRoadmapPrivate) {
    const roadmapIdx = roadmaps.value.findIndex(
      (item) => item.id === roadmap.id,
    );
    if (roadmapIdx === -1) return;
    if (!roadmaps.value[roadmapIdx]) return;

    Object.assign(roadmaps.value[roadmapIdx], roadmap);
  }

  function removeRoadmap(roadmapId: string) {
    const roadmapIdx = roadmaps.value.findIndex(
      (item) => item.id === roadmapId,
    );
    if (roadmapIdx === -1) return;

    roadmaps.value.splice(roadmapIdx, 1);
  }

  function sortRoadmap(fromIndex: number, toIndex: number) {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= roadmaps.value.length ||
      toIndex >= roadmaps.value.length
    ) {
      return;
    }

    const fromRoadmap = roadmaps.value[fromIndex];
    const toRoadmap = roadmaps.value[toIndex];

    if (!fromRoadmap || !toRoadmap) return;

    updateRoadmap({
      ...fromRoadmap,
      index: toIndex,
    });
    updateRoadmap({
      ...toRoadmap,
      index: fromIndex,
    });
  }

  async function resetRoadmaps() {
    abortController?.abort();
    state.value = "IDLE";
    currentCursor.value = undefined;
    hasNextPage.value = false;
    errorCode.value = undefined;
    roadmaps.value = [];

    await fetchRoadmaps();
  }

  return {
    roadmaps,
    state,
    error: errorCode,

    fetchRoadmaps,
    appendRoadmap,
    updateRoadmap,
    removeRoadmap,
    sortRoadmap,
    resetRoadmaps,
  };
});
