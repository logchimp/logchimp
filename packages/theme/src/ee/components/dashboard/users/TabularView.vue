<template>
  <Table>
    <template #header>
      <Td
        class="table-header-item"
        :style="{
          minWidth: '150px',
        }"
      />
       <Td
         :style="{
          width: '350px',
        }"
        class="flex"
       >
         Roles
      </Td>
      <Td
        :style="{
          width: '100px',
        }"
      >
        Posts
      </Td>
      <Td
        :style="{
          width: '100px',
        }"
      >
        Votes
      </Td>
    </template>

    <Tr
      v-for="row in dashboardUsers.users"
      :key="row.userId"
    >
      <DashboardUsersTabularItem
        :user="row"
        :settings="settings"
      />
    </Tr>

    <infinite-scroll
      :on-infinite="dashboardUsers.fetchUsers"
      :state="dashboardUsers.state"
    />
  </Table>
</template>

<script setup lang="ts">
import DashboardUsersTabularItem from "./TabularItem/TabularItem.vue";
import Table from "../../../../components/ui/Table/Table.vue";
import Td from "../../../../components/ui/Table/Td.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import { useSettingStore } from "../../../../store/settings";
import { useDashboardUsers } from "../../../../store/dashboard/users";

const { settings } = useSettingStore();
const dashboardUsers = useDashboardUsers();

defineOptions({
  name: "DashboardUsersTabularView",
});
</script>
