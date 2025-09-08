<template>
  <DropdownV2>
    <template #trigger>
      <DropdownMenuTrigger>
        <avatar
          class="cursor-pointer"
          :src="userStore.user.avatar"
          :name="userStore.user.name || userStore.user.username"
        />
      </DropdownMenuTrigger>
    </template>

    <DropdownV2Content
      align="end"
      side="bottom"
      :loop="true"
      :side-offset="8"
    >
      <template v-if="accessDashboard">
        <dropdown-item
          @click="router.push('/dashboard')"
        >
          <template #icon>
            <dashboard-icon aria-hidden="true" />
          </template>
          Dashboard
        </dropdown-item>
        <DropdownV2Separator />
      </template>

      <dropdown-item
       @click="router.push('/settings')"
      >
        <template #icon>
          <settings-icon aria-hidden="true" />
        </template>
        Settings
      </dropdown-item>

      <dropdown-item
        @click="userStore.logout"
      >
        <template #icon>
          <logout-icon aria-hidden="true" />
        </template>
        Sign out
      </dropdown-item>

      <dropdown-item v-if="showVersion" :disabled="true">
        {{ VITE_LOGCHIMP_VERSION }}
      </dropdown-item>
    </DropdownV2Content>
  </DropdownV2>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  LayoutDashboard as DashboardIcon,
  LogOut as LogoutIcon,
  Settings as SettingsIcon,
} from "lucide-vue";
import { DropdownMenuTrigger } from "reka-ui";

import { Avatar } from "./ui/Avatar";
import DropdownV2 from "./ui/DropdownV2/Dropdown.vue";
import DropdownV2Content from "./ui/DropdownV2/DropdownContent.vue";
import DropdownItem from "./ui/DropdownV2/DropdownItem.vue";
import DropdownV2Separator from "./ui/DropdownV2/DropdownSeparator.vue";
import { router } from "../router";
import { VITE_LOGCHIMP_VERSION } from "../constants";
import { useSettingStore } from "../store/settings";
import { useUserStore } from "../store/user";

const settingsStore = useSettingStore();
const userStore = useUserStore();

const accessDashboard = computed(() => {
  return userStore.permissions.includes("dashboard:read");
});

const showVersion = computed(() => {
  return (
    userStore.permissions.includes("dashboard:read") &&
    settingsStore.get.developer_mode &&
    VITE_LOGCHIMP_VERSION
  );
});
</script>
