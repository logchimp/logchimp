<template>
  <div class="sidebar">
    <header>
      <site-branding :dashboard="true" />
    </header>
    <div class="sidebar-list">
      <h6>Manage</h6>
      <li>
        <router-link to="/dashboard" class="sidebar-list-item">
          <dashboard-icon />
          <p>Dashbaord</p>
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
            <dropdown-item @click="signOut">
              <template #icon>
                <logout-icon />
              </template>
              Sign Out
            </dropdown-item>
          </dropdown>
        </template>
        <template #toggle>
          <div class="dashboard-sidebar-user-container">
            <div class="dashboard-sidebar-user">
              <avatar
                class="dashboard-sidebar-user-avatar"
                :src="user.avatar"
                :name="user.name || user.username"
              />
              <div class="dashboard-sidebar-user-data">
                <div class="dashboard-sidebar-user-name">
                  {{ user.name || user.username }}
                </div>
                <div class="dashboard-sidebar-user-email">
                  {{ user.email }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </dropdown-wrapper>
    </footer>
  </div>
</template>

<script>
// packages
import {
  LayoutDashboard as DashboardIcon,
  Columns as BoardIcon,
  File as PostIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  FlaskConical as LabIcon,
  Info as InfoIcon,
  Twitter as TwitterIcon,
  LogOut as LogoutIcon
} from "lucide-vue";

// components
import SiteBranding from "../SiteBranding";
import Avatar from "../Avatar";
import DropdownWrapper from "../dropdown/DropdownWrapper";
import Dropdown from "../dropdown/Dropdown";
import DropdownItem from "../dropdown/DropdownItem";
import DropdownSpacer from "../dropdown/DropdownSpacer";

// icons
import RoadmapIcon from "../../components/icons/Roadmap";

export default {
  name: "DashboardSidebar",
  components: {
    // components
    SiteBranding,
    Avatar,
    DropdownWrapper,
    Dropdown,
    DropdownItem,
    DropdownSpacer,

    // icons
    DashboardIcon,
    BoardIcon,
    RoadmapIcon,
    PostIcon,
    UsersIcon,
    SettingsIcon,
    LabIcon,
    InfoIcon,
    TwitterIcon,
    LogoutIcon,
    ShieldIcon
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    },
    user() {
      return this.$store.getters["user/getUser"];
    }
  },
  methods: {
    aboutLogChimp() {
      window.open("https://logchimp.codecarrot.net/");
    },
    tweetLogChimp() {
      window.open(
        "https://twitter.com/intent/tweet?text=%40LogChimp+Hi%21+Can+you+help+me+with+&related=LogChimp"
      );
    },
    signOut() {
      this.$store.dispatch("user/logout");
    }
  }
};
</script>
