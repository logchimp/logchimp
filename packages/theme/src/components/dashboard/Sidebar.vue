<template>
  <div class="sidebar">
    <header>
      <site-branding :title="siteSettings.title" :logo="siteSettings.logo" :dashboard="true" text-color="white" />
    </header>
    <div class="sidebar-list">
      <h6>Manage</h6>
      <li>
        <router-link to="/dashboard" class="sidebar-list-item">
          <dashboard-icon />
          <p>Dashboard</p>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/boards" class="sidebar-list-item">
          <board-icon />
          <p>Boards</p>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/roadmaps" class="sidebar-list-item">
          <roadmap-icon />
          <p>Roadmaps</p>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/posts" class="sidebar-list-item">
          <post-icon />
          <p>Posts</p>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/users" class="sidebar-list-item">
          <users-icon />
          <p>Users</p>
        </router-link>
      </li>
    </div>

    <div class="sidebar-list">
      <h6>Settings</h6>
      <li>
        <router-link to="/dashboard/settings/general" class="sidebar-list-item">
          <settings-icon />
          <p>General</p>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/settings/billing" class="sidebar-list-item">
          <credit-card-icon />
          <p>Billing</p>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/settings/roles" class="sidebar-list-item">
          <shield-icon />
          <p>Roles</p>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/settings/labs" class="sidebar-list-item">
          <lab-icon />
          <p>Labs</p>
        </router-link>
      </li>
    </div>

    <div class="sidebar-list">
      <li>
        <router-link to="/" class="sidebar-list-item">
          <arrow-up-right-icon />
          <p>Public view</p>
        </router-link>
      </li>
    </div>

    <footer>
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
    </footer>
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
  LogOut as LogoutIcon
} from "lucide-vue";

import { useSettingStore } from "../../store/settings"
import { useUserStore } from "../../store/user"

// components
import SiteBranding from "../site/SiteBranding.vue";
import AuthUser from "./AuthUser.vue";
import DropdownWrapper from "../ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../ui/dropdown/Dropdown.vue";
import DropdownItem from "../ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "../ui/dropdown/DropdownSpacer.vue";

// icons
import RoadmapIcon from "../../components/icons/Roadmap.vue";

const { get: siteSettings } = useSettingStore()
const { user, logout } = useUserStore()

function aboutLogChimp() {
	window.open("https://logchimp.codecarrot.net/");
}

function tweetLogChimp() {
	window.open(
		"https://twitter.com/intent/tweet?text=%40LogChimp+Hi%21+Can+you+help+me+with+&related=LogChimp"
	);
}
</script>

<style lang='sass'>
$white: var(--color-white)

.sidebar
	display: flex
	flex-direction: column
	position: sticky
	top: 0
	bottom: 0
	background-color: var(--color-brand-color)
	height: 100vh
	padding: 1rem
	min-width: 200px
	overflow-y: auto

	header
		margin-bottom: 1rem

	footer
		position: relative
		margin-top: auto

.sidebar-list
	margin-top: 2rem

	h6
		font-size: 0.75rem
		text-transform: uppercase
		color: var(--color-white)
		letter-spacing: 0.4px
		margin-bottom: 0.625rem

	li
		list-style: none

.sidebar-list-item
	display: flex
	align-items: center
	padding: 0.625rem 1rem

	svg
		stroke: var(--color-white)
		width: 1rem
		height: 1rem
		margin-right: 0.375rem

	p
		color: var(--color-white)

.sidebar-list-item.router-link-exact-active
	background-color: rgba($white, 0.1)
	border-radius: var(--border-radius-default)

	p
		font-weight: 600

.dashboard-sidebar-dropdown
	top: -9rem
</style>
