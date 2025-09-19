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
      <SidebarListHeading>{{t("dashboard.sidebar.manage.manage")}}</SidebarListHeading>
      <ul>
        <li>
          <SidebarItem to="/dashboard">
            <dashboard-icon />
            <p>{{t("dashboard.sidebar.manage.dashboard")}}</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/boards">
            <board-icon />
            <p>{{t("dashboard.sidebar.manage.boards")}}</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/roadmaps">
            <roadmap-icon />
            <p>{{t("dashboard.sidebar.manage.roadmaps")}}</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/posts">
            <post-icon />
            <p>{{t("dashboard.sidebar.manage.posts")}}</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/users">
            <users-icon />
            <p>{{t("dashboard.sidebar.manage.users")}}</p>
          </SidebarItem>
        </li>
      </ul>
    </SidebarList>

    <SidebarList>
      <SidebarListHeading>{{t("dashboard.sidebar.settings.settings")}}</SidebarListHeading>
      <ul>
        <li>
          <SidebarItem to="/dashboard/settings/general">
            <settings-icon />
            <p>{{t("dashboard.sidebar.settings.general")}}</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/billing">
            <credit-card-icon />
            <p>{{t("dashboard.sidebar.settings.billing")}}</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/roles">
            <shield-icon />
            <p>{{t("dashboard.sidebar.settings.roles")}}</p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/labs">
            <lab-icon />
            <p>{{t("dashboard.sidebar.settings.labs")}}</p>
          </SidebarItem>
        </li>
      </ul>
    </SidebarList>

    <ul class="mt-6">
      <li>
        <SidebarItem to="/">
          <arrow-up-right-icon />
          <p>{{t("dashboard.sidebar.publicView")}}</p>
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
import { useI18n } from "vue-i18n";

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
const { t } = useI18n();
</script>
