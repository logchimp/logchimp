<template>
  <header class="header">
    <div class="container">
      <div class="header-container">
        <site-branding :dashboard="false" />
        <nav class="header-nav">
          <dropdown-wrapper v-if="isAuthenticated" class="nav-item">
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
              v-if="getSiteSittings.allowSignup"
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

<script>
// packages
import {
  LayoutDashboard as DashboardIcon,
  Settings as SettingsIcon,
  LogOut as LogoutIcon
} from "lucide-vue";

// components
import Navbar from "./Navbar";
import SiteBranding from "./SiteBranding";
import DropdownWrapper from "./dropdown/DropdownWrapper";
import Dropdown from "./dropdown/Dropdown";
import DropdownItem from "./dropdown/DropdownItem";
import DropdownSpacer from "./dropdown/DropdownSpacer";
import Button from "./Button";
import Avatar from "./Avatar";

export default {
  name: "Header",
  components: {
    // components
    Navbar,
    SiteBranding,
    DropdownWrapper,
    Dropdown,
    DropdownItem,
    DropdownSpacer,
    Button,
    Avatar,

    // icons
    DashboardIcon,
    SettingsIcon,
    LogoutIcon
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    },
    accessDashboard() {
      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("dashboard:read");
      return checkPermission;
    },
    isAuthenticated() {
      const token = this.$store.getters["user/getAuthToken"];
      return !!token;
    },
    user() {
      return this.$store.getters["user/getUser"];
    }
  },
  methods: {
    openDashboard() {
      this.$router.push("/dashboard");
    },
    settings() {
      this.$router.push("/settings");
    },
    login() {
      this.$router.push("/login");
    },
    join() {
      this.$router.push("/join");
    },
    logout() {
      this.$store.dispatch("user/logout");
    }
  }
};
</script>
