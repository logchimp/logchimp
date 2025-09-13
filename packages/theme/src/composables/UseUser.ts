import { ref } from "vue";
import type { IUser } from "@logchimp/types";

const selectedUser = ref<IUser | null>(null);

export function useUser() {
  return {
    selectedUser,
    setUser: (user: IUser) => (selectedUser.value = user),
    clearUser: () => (selectedUser.value = null),
  };
}
