import type { InjectionKey } from "vue";
import type { IRoadmapPrivate } from "@logchimp/types";

/**
 * Symbol to exchange roadmap's data
 */
export const roadmapKey = Symbol() as InjectionKey<IRoadmapPrivate>;
