<template>
  <DashboardPageHeader />

  <div class="h-full flex items-center justify-center">
    <h1 class="text-4xl font-bold">
      Page not found
    </h1>
  </div>
</template>

<script setup lang="ts">
import DashboardPageHeader from "../../components/dashboard/PageHeader.vue";

defineOptions({
  name: "PageNotFound",
});
</script>
