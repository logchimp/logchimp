<template>
  <div class="dashboard">
    <aside>
      <Sidebar />
    </aside>
    <main class="container-view">
      <router-view />
      <power-by v-if="getSiteSittings.isPoweredBy" />
    </main>
  </div>
</template>

<script>
// components
import Sidebar from "../components/dashboard/Sidebar";
import PowerBy from "../components/PowerBy";

export default {
  name: "DashboardLayout",
  components: {
    Sidebar,
    PowerBy
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    }
  }
};
</script>
