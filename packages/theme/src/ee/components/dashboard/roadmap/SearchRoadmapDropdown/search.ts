import { ref } from "vue";
import type { IRoadmap, IRoadmapPrivate } from "@logchimp/types";

export type TCurrentRoadmap = IRoadmap | IRoadmapPrivate | null;
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
