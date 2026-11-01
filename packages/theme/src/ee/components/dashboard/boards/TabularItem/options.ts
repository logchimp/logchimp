import type { InjectionKey } from "vue";
import type { components } from "@logchimp/api-ts-types";

/**
 * Symbol to exchange board data
 */
export const boardKey = Symbol() as InjectionKey<
  components["schemas"]["BoardPrivate"]
>;
