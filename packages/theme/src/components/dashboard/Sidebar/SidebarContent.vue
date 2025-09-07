<template>
  <div class="flex flex-col px-2 pt-6 pb-2 h-full">
    <div class="px-3">
      <site-branding
        :title="siteSettings.title"
        :logo="siteSettings.logo"
        :dashboard="true"
        text-color="black"
      />
    </div>

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

    <LanguageDropdown/>
    
    <div class="mt-auto relative">
      <dashboard-sidebar-auth-user-dropdown />
    </div>
  </div>
</template>

<script setup lang="ts">
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
} from "lucide-vue";

import { useSettingStore } from "../../../store/settings";

// components
import SiteBranding from "../../site/SiteBranding.vue";
import SidebarItem from "./SidebarItem.vue";
import RoadmapIcon from "../../icons/Roadmap.vue";
import SidebarList from "./SidebarList.vue";
import SidebarListHeading from "./SidebarListHeading.vue";
import DashboardSidebarAuthUserDropdown from "./AuthUser/Dropdown.vue";
import LanguageDropdown from "../../ui/LanguageDropdown.vue";

const { get: siteSettings } = useSettingStore();
</script>
