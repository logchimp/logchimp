<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Users</BreadcrumbItem>
      </Breadcrumbs>
    </template>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <Table class="users-table">
      <template #header>
        <div class="table-header-item users-table-user">name</div>
        <div class="table-header-item users-table-user">roles</div>
        <div class="table-header-item users-table-posts">posts</div>
        <div class="table-header-item users-table-votes">votes</div>
        <div
          v-if="settings.developer_mode"
          class="table-header-item users-table-votes"
        />
      </template>

      <div
        v-for="user in dashboardUsers.users"
        :key="user.userId"
        class="relative table-row group"
      >
        <DashboardUsersTabularItem :user="user" :settings="settings" />
      </div>

      <infinite-scroll :on-infinite="dashboardUsers.fetchUsers" :state="dashboardUsers.state" />
    </Table>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";

// modules
import { useSettingStore } from "../../store/settings";
import { useDashboardUsers } from "../../store/dashboard/users";

// components
import InfiniteScroll from "../../components/ui/InfiniteScroll.vue";
import Table from "../../components/ui/Table.vue";
import Breadcrumbs from "../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardUsersTabularItem from "../../ee/components/dashboard/users/TabularItem/TabularItem.vue";

const { settings } = useSettingStore();
const dashboardUsers = useDashboardUsers();

useHead({
  title: "Users • Dashboard",
});

defineOptions({
  name: "DashboardUsers",
});
</script>

<style lang='sass'>
.users-table
  .users-table-user
    display: flex
    align-items: center
    flex: 6

    .users-table-user-avatar
      margin-right: 0.5rem

    .users-table-user-name
      margin-bottom: 0

  .users-table-posts
    flex: 1

  .users-table-votes
    flex: 1
</style>
