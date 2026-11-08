import type { InjectionKey } from "vue";
import type { components } from "@logchimp/api-ts-types";

/**
 * Symbol to exchange roadmap's data
 */
export const roadmapKey = Symbol() as InjectionKey<
  components["schemas"]["RoadmapPrivate"]
>;
