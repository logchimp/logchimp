import type { InjectionKey } from "vue";
import type { IUser } from "@logchimp/types";

/**
 * Symbol to exchange user's ID
 */
export const userIdKey = Symbol() as InjectionKey<string>;

/**
 * Symbol to exchange openUserDialog function
 */
export const openUserDialogKey = Symbol() as InjectionKey<(user: IUser) => void>;
