<template>
  <DashboardPageHeader class="md:hidden" />
  <Dashboard404 />
</template>

<script setup lang="ts">
import DashboardPageHeader from "../../components/dashboard/PageHeader.vue";
import Dashboard404 from "../../components/dashboard/404.vue";

defineOptions({
  name: "PageNotFound",
});
</script>
