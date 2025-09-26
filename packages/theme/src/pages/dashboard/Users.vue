<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Users</BreadcrumbItem>
      </Breadcrumbs>
    </template>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <DashboardUsersTabularView />
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";

// components
import Breadcrumbs from "../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardUsersTabularView from "../../ee/components/dashboard/users/TabularView.vue";

useHead({
  title: "Users • Dashboard",
});

defineOptions({
  name: "DashboardUsers",
});
</script>
