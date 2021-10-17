<template>
  <router-link :to="link" class="site-info">
    <div class="logo-placeholder">
      <img
        class="site-logo"
        :src="logo"
        :alt="title"
      >
    </div>
    <h5 v-if="title" class="site-name">
      {{ title }}
    </h5>
  </router-link>
</template>

<script>
export default {
  name: "SiteBranding",
  props: {
    dashboard: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getSettings() {
      return this.$store.getters["settings/get"];
    },
    title() {
      return this.getSettings.title;
    },
    logo() {
      return this.getSettings.logo;
    },
    link() {
      return this.dashboard ? "/dashboard" : "/";
    }
  }
};
</script>
