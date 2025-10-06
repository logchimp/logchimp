import type { InjectionKey } from "vue";
import type { IBoardPrivate } from "@logchimp/types";

/**
 * Symbol to exchange board data
 */
export const boardKey = Symbol() as InjectionKey<IBoardPrivate>;
