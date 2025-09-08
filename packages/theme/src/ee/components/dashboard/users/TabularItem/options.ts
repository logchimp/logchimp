import type { InjectionKey } from "vue";

/**
 * Symbol to exchange user's ID
 */
export const userIdKey = Symbol() as InjectionKey<string>;
