<template>
  <header class="header">
    <div class="container">
      <div class="header-container">
        <site-branding :title="siteSettings.title" :logo="siteSettings.logo" />
        <nav class="header-nav">
          <dropdown-wrapper v-if="getUserId" class="nav-item">
            <template #toggle>
              <avatar
                class="nav-profile"
                :src="user.avatar"
                :name="user.name || user.username"
              />
            </template>
            <template #default="dropdown">
              <dropdown v-if="dropdown.active" class="nav-profile-dropdown sw">
                <dropdown-item v-if="accessDashboard" @click="openDashboard">
                  <template #icon>
                    <dashboard-icon />
                  </template>
                  Dashbaord
                </dropdown-item>
                <dropdown-item @click="settings">
                  <template #icon>
                    <settings-icon />
                  </template>
                  Settings
                </dropdown-item>
                <dropdown-spacer />
                <dropdown-item @click="logout">
                  <template #icon>
                    <logout-icon />
                  </template>
                  Sign out
                </dropdown-item>
              </dropdown>
            </template>
          </dropdown-wrapper>
          <div v-else class="nav-item nav-auth">
            <Button type="text" @click="login">
              Login
            </Button>
            <Button
              v-if="siteSettings.allowSignup"
              type="outline"
              @click="join"
            >
              Create an account
            </Button>
          </div>
        </nav>
      </div>
      <navbar />
    </div>
  </header>
</template>

<script setup lang="ts">
// packages
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  LayoutDashboard as DashboardIcon,
  Settings as SettingsIcon,
  LogOut as LogoutIcon
} from "lucide-vue";

import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"

// components
import Navbar from "./Navbar.vue";
import SiteBranding from "./SiteBranding.vue";
import DropdownWrapper from "./dropdown/DropdownWrapper.vue";
import Dropdown from "./dropdown/Dropdown.vue";
import DropdownItem from "./dropdown/DropdownItem.vue";
import DropdownSpacer from "./dropdown/DropdownSpacer.vue";
import Button from "./Button.vue";
import Avatar from "./Avatar";

const router = useRouter();
const { get: siteSettings } = useSettingStore()
const { user, getUserId, permissions, logout } = useUserStore()

const accessDashboard = computed(() => {
	const checkPermission = permissions.includes("dashboard:read");
	return checkPermission;
})

function openDashboard() {
	router.push("/dashboard");
}

function settings() {
	router.push("/settings");
}

function login() {
	router.push("/login");
}

function join() {
	router.push("/join");
}
</script>
