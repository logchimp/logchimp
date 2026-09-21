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
      <SidebarListHeading>
        {{ t("actions.manage") }}
      </SidebarListHeading>
      <ul>
        <li>
          <SidebarItem to="/dashboard">
            <dashboard-icon />
            <p>
              {{ t("dashboard_title") }}
            </p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/boards">
            <board-icon />
            <p>
              {{ t("boards.boards_title") }}
            </p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/roadmaps">
            <roadmap-icon />
            <p>
              {{ t("roadmaps.roadmaps_title") }}
            </p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/posts">
            <post-icon />
            <p>
              {{ t("posts.posts_title") }}
            </p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/users">
            <users-icon />
            <p>
              {{ t("users.users_title") }}
            </p>
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
            <p>
              {{ t("settings.general.general_title") }}
            </p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/billing">
            <credit-card-icon />
            <p>
              {{ t("settings.billing.billing_title") }}
            </p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/roles">
            <shield-icon />
            <p>
              {{ t("roles.roles_title") }}
            </p>
          </SidebarItem>
        </li>
        <li>
          <SidebarItem to="/dashboard/settings/labs">
            <lab-icon />
            <p>
              {{ t("settings.labs.labs_title") }}
            </p>
          </SidebarItem>
        </li>
      </ul>
    </SidebarList>

    <ul class="mt-6">
      <li>
        <SidebarItem to="/">
          <arrow-up-right-icon />
          <p>
            {{ t("public_view_text") }}
          </p>
        </SidebarItem>
      </li>
    </ul>

    <LanguageDropdown />

    <div class="mt-auto relative">
      <dashboard-sidebar-auth-user-dropdown />
      <p
        v-if="logchimpVersion"
        class="text-center text-xs text-neutral-400 py-1"
      >
        v{{ logchimpVersion }}
      </p>
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
import { VITE_LOGCHIMP_VERSION } from "../../../constants";

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

const logchimpVersion = VITE_LOGCHIMP_VERSION;
</script>
