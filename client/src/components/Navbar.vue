<template>
  <div class="navbar">
    <router-link to="/" class="navbar-item">
      <div class="navbar-item-icon">
        <home-icon />
      </div>
      <div class="navbar-item-content">
        Home
      </div>
    </router-link>
    <router-link to="/roadmaps" class="navbar-item">
      <div class="navbar-item-icon">
        <roadmap-icon />
      </div>
      <div class="navbar-item-content">
        Roadmaps
      </div>
    </router-link>
    <router-link to="/boards" class="navbar-item">
      <div class="navbar-item-icon">
        <board-icon />
      </div>
      <div class="navbar-item-content">
        Boards
      </div>
    </router-link>
  </div>
</template>

<script>
// packages
import { Home as HomeIcon, Columns as BoardIcon } from "lucide-vue";

// icons
import RoadmapIcon from "./icons/Roadmap";

export default {
  name: "Navbar",
  components: {
    // icons
    HomeIcon,
    RoadmapIcon,
    BoardIcon
  }
};
</script>
