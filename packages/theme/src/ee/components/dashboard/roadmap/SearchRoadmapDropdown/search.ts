import { ref } from "vue";
import type { IRoadmapPrivate } from "@logchimp/types";

export type TCurrentRoadmap = IRoadmapPrivate | null;
const currentRoadmap = ref<TCurrentRoadmap>(null);

export function useRoadmapSearch() {
  function select(_roadmap: TCurrentRoadmap) {
    currentRoadmap.value = _roadmap;
  }

  function clear() {
    currentRoadmap.value = null;
  }

  return {
    roadmap: currentRoadmap,

    select,
    clear,
  };
}
