import type { InjectionKey } from "vue";
import type { IUserRole } from "@logchimp/types";

/**
 * Symbol to exchange user's roles
 */
export const userRolesKey = Symbol() as InjectionKey<IUserRole[]>;

/**
 * Symbol to exchange user's ID
 */
export const userIdKey = Symbol() as InjectionKey<string>;
