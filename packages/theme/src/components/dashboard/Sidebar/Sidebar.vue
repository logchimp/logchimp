<template>
  <div class="flex flex-col px-2 py-4">
    <header class="mb-4 px-3">
      <site-branding
        :title="siteSettings.title"
        :logo="siteSettings.logo"
        :dashboard="true"
        text-color="white"
      />
    </header>

    <SidebarList>
      <SidebarListHeading>Manage</SidebarListHeading>
      <ul>
        <li>
          <SidebarItem to="/dashboard">
            <dashboard-icon />
            <p>Dashboard</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/boards">
            <board-icon />
            <p>Boards</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/roadmaps">
            <roadmap-icon />
            <p>Roadmaps</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/posts">
            <post-icon />
            <p>Posts</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/users">
            <users-icon />
            <p>Users</p>
          </SidebarItem>
        </li>
      </ul>
    </SidebarList>

    <SidebarList>
      <SidebarListHeading>Settings</SidebarListHeading>
      <ul>
        <li>
          <SidebarItem to="/dashboard/settings/general">
            <settings-icon />
            <p>General</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/billing">
            <credit-card-icon />
            <p>Billing</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/roles">
            <shield-icon />
            <p>Roles</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/labs">
            <lab-icon />
            <p>Labs</p>
          </SidebarItem>
        </li>
      </ul>
    </SidebarList>

    <ul class="mt-6">
      <li>
        <SidebarItem to="/">
          <arrow-up-right-icon />
          <p>Public view</p>
        </SidebarItem>
      </li>
    </ul>

    <div class="mt-auto relative">
      <dropdown-wrapper>
        <template #default="dropdown">
          <dropdown v-if="dropdown.active" class="dashboard-sidebar-dropdown">
            <dropdown-item @click="aboutLogChimp">
              <template #icon>
                <info-icon />
              </template>
              About LogChimp
            </dropdown-item>
            <dropdown-item @click="tweetLogChimp">
              <template #icon>
                <twitter-icon />
              </template>
              Tweet @LogChimp!
            </dropdown-item>
            <dropdown-spacer />
            <dropdown-item @click="logout">
              <template #icon>
                <logout-icon />
              </template>
              Sign Out
            </dropdown-item>
          </dropdown>
        </template>
        <template #toggle>
          <auth-user
						:name="user.name"
						:email="user.email"
						:username="user.username"
						:avatar="user.avatar"
					/>
        </template>
      </dropdown-wrapper>
    </div>
  </div>
</template>

<script setup lang="ts">
// packages
import {
  LayoutDashboard as DashboardIcon,
  Columns as BoardIcon,
  File as PostIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  FlaskConical as LabIcon,
  ArrowUpRight as ArrowUpRightIcon,
  CreditCard as CreditCardIcon,
  Info as InfoIcon,
  Twitter as TwitterIcon,
  LogOut as LogoutIcon,
} from "lucide-vue";

import { useSettingStore } from "../../../store/settings.ts";
import { useUserStore } from "../../../store/user.ts";

// components
import SiteBranding from "../../site/SiteBranding.vue";
import AuthUser from "../AuthUser.vue";
import DropdownWrapper from "../../ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../ui/dropdown/Dropdown.vue";
import DropdownItem from "../../ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "../../ui/dropdown/DropdownSpacer.vue";
import SidebarItem from "./SidebarItem.vue";

// icons
import RoadmapIcon from "../../icons/Roadmap.vue";
import SidebarList from "./SidebarList.vue";
import SidebarListHeading from "./SidebarListHeading.vue";

const { get: siteSettings } = useSettingStore();
const { user, logout } = useUserStore();

function aboutLogChimp() {
  window.open("https://logchimp.codecarrot.net/");
}

function tweetLogChimp() {
  window.open(
    "https://twitter.com/intent/tweet?text=%40LogChimp+Hi%21+Can+you+help+me+with+&related=LogChimp",
  );
}
</script>

<style lang='sass'>
.dashboard-sidebar-dropdown
	top: -9rem
</style>
