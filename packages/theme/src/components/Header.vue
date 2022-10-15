<template>
  <header class="header">
    <div class="container">
      <div class="header-container">
        <site-branding :title="settingsStore.get.title" :logo="settingsStore.get.logo" text-color="white" />
        <nav class="header-nav">
          <dropdown-wrapper v-if="userStore.user.userId" class="nav-item">
            <template #toggle>
              <avatar
                class="nav-profile"
                :src="userStore.user.avatar"
                :name="userStore.user.name || userStore.user.username"
              />
            </template>
            <template #default="dropdown">
              <dropdown v-if="dropdown.active" class="nav-profile-dropdown sw">
                <dropdown-item v-if="accessDashboard" @click="openDashboard">
                  <template #icon>
                    <dashboard-icon />
                  </template>
                  Dashboard
                </dropdown-item>
                <dropdown-item @click="settings">
                  <template #icon>
                    <settings-icon />
                  </template>
                  Settings
                </dropdown-item>
                <dropdown-spacer />
                <dropdown-item @click="userStore.logout">
                  <template #icon>
                    <logout-icon />
                  </template>
                  Sign out
                </dropdown-item>
                <dropdown-item v-if="showVersion" :disabled="true">
                  {{ version }}
                </dropdown-item>
              </dropdown>
            </template>
          </dropdown-wrapper>
          <div v-else class="nav-item nav-auth">
            <Button type="primary" href="/login" size="small"> Login </Button>
            <Button
              v-if="settingsStore.get.allowSignup"
              type="primary"
              :outline="true"
              href="/join"
              size="small"
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
import {
  LayoutDashboard as DashboardIcon,
  Settings as SettingsIcon,
  LogOut as LogoutIcon
} from "lucide-vue";

import { router } from "../router";
import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"

// components
import Navbar from "./Navbar.vue";
import SiteBranding from "./site/SiteBranding.vue";
import DropdownWrapper from "./ui/dropdown/DropdownWrapper.vue";
import Dropdown from "./ui/dropdown/Dropdown.vue";
import DropdownItem from "./ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "./ui/dropdown/DropdownSpacer.vue";
import Button from "./ui/Button.vue";
import { Avatar } from "./ui/Avatar";

const settingsStore = useSettingStore()
const userStore = useUserStore()

const accessDashboard = computed(() => {
	const checkPermission = userStore.permissions.includes("dashboard:read");
	return checkPermission;
})

function openDashboard() {
	router.push("/dashboard");
}

function settings() {
	router.push("/settings");
}

const showVersion = computed(() => {
	return (
		userStore.permissions.includes("dashboard:read") &&
		settingsStore.get.developer_mode
	);
})

const version = computed(() => {
	return process.env.version;
})
</script>

<style lang='sass'>
.header
  background-color: var(--color-brand-color)

.header-container, .nav-item
  display: flex
  align-items: center

.header-container
  padding: 1rem 0

// nav
.header-nav
  margin-left: auto

.nav-item
  margin-left: 1.5rem
  color: rgba(255, 255, 255, 0.5)
  font-weight: 500
  position: relative

  &:first-child
    margin-left: 0

.nav-profile
  cursor: pointer

.nav-profile-dropdown
  top: 2.4rem

.nav-auth-link
  cursor: pointer

  &:hover
    color: var(--color-white)
</style>
