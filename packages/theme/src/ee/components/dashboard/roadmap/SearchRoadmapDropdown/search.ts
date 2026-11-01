import { ref } from "vue";
import type { components } from "@logchimp/api-ts-types";

export type TCurrentRoadmap =
  | components["schemas"]["RoadmapItem"]
  | components["schemas"]["RoadmapPrivate"]
  | null;
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
