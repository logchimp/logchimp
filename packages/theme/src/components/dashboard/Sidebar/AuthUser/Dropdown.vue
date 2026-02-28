<template>
  <DropdownV2>
    <template #trigger>
      <DropdownMenuTrigger class="w-full">
        <auth-user
          :name="user.name"
          :email="user.email"
          :username="user.username"
          :avatar="user.avatar"
        />
      </DropdownMenuTrigger>
    </template>

    <DropdownV2Content
      align="start"
      side="top"
      :loop="true"
      :side-offset="8"
      class="w-54"
    >
      <Dropdown-v2-item @click="aboutLogChimp">
        <template #icon>
          <info-icon aria-hidden="true" />
        </template>
        About LogChimp
      </Dropdown-v2-item>
      <dropdown-v2-item @click="tweetLogChimp">
        <template #icon>
          <twitter-icon />
        </template>
        Tweet @LogChimp!
      </dropdown-v2-item>
      <dropdown-v2-separator />
      <dropdown-v2-item @click="logout">
        <template #icon>
          <logout-icon />
        </template>
        Sign Out
      </dropdown-v2-item>
    </DropdownV2Content>
  </DropdownV2>
</template>

<script setup lang="ts">
import {
  Info as InfoIcon,
  Twitter as TwitterIcon,
  LogOut as LogoutIcon,
} from "lucide-vue";
import { DropdownMenuTrigger } from "reka-ui";

import { useUserStore } from "../../../../store/user";

import AuthUser from "./AuthUser.vue";
import DropdownV2 from "../../../ui/DropdownV2/Dropdown.vue";
import DropdownV2Content from "../../../ui/DropdownV2/DropdownContent.vue";
import DropdownV2Item from "../../../ui/DropdownV2/DropdownItem.vue";
import DropdownV2Separator from "../../../ui/DropdownV2/DropdownSeparator.vue";

const { user, logout } = useUserStore();

function aboutLogChimp() {
  window.open("https://logchimp.app");
}

function tweetLogChimp() {
  window.open(
    "https://twitter.com/intent/tweet?text=%40LogChimp+Hi%21+Can+you+help+me+with+&related=LogChimp",
  );
}

defineOptions({
  name: "DashboardSidebarAuthUserDropdown",
});
</script>
