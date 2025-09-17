<template>
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
      class="table-row group"
    >
      <DashboardUsersTabularItem :user="user" :settings="settings" />
    </div>

    <infinite-scroll :on-infinite="dashboardUsers.fetchUsers" :state="dashboardUsers.state" />
  </Table>
</template>

<script setup lang="ts">
import DashboardUsersTabularItem from "./TabularItem/TabularItem.vue";
import Table from "../../../../components/ui/Table.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import { useSettingStore } from "../../../../store/settings";
import { useDashboardUsers } from "../../../../store/dashboard/users";

const { settings } = useSettingStore();
const dashboardUsers = useDashboardUsers();

defineOptions({
  name: "DashboardUsersTabularView",
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
