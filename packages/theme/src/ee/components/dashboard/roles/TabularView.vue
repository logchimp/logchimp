<template>
  <Table>
    <template #header>
      <Td :head="true" />
      <Td
        :head="true"
        :style="{
          minWidth: '500px',
        }"
        class="flex-1"
      >
        Name
      </Td>
      <Td
        :head="true"
        :style="{
          width: '40px',
        }"
      />
    </template>

    <Tr
      v-for="role in dashboardRoles.roles"
      :key="role.id"
    >
      <TabularItem :role="role" />
    </Tr>

    <template #infinite-loader>
      <infinite-scroll
        :on-infinite="dashboardRoles.fetchRoles"
        :state="dashboardRoles.state"
      />
    </template>
  </Table>
</template>

<script setup lang="ts">
import { useDashboardRoles } from "../../../store/dashboard/roles";

import Table from "../../../../components/ui/Table/Table.vue";
import TabularItem from "./TabularItem/TabularItem.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";
import Td from "../../../../components/ui/Table/Td.vue";

const dashboardRoles = useDashboardRoles();

defineOptions({
  name: "DashboardRolesTabularView",
});
</script>
