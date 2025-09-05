import { ref } from "vue"
import type { IRoadmapPrivate } from "@logchimp/types";

const currentRoadmap = ref<IRoadmapPrivate>();

export function useRoadmapSearch() {
  function select(_roadmap: IRoadmapPrivate) {
    currentRoadmap.value = _roadmap;
  }

  function clear() {
    currentRoadmap.value = undefined;
  }

  return {
    roadmap: currentRoadmap,

    select,
    clear,
  }
}