<template>
  <Table>
    <template #header>
      <tr
        v-for="headerGroup in table.getHeaderGroups()"
        :key="headerGroup.id"
      >
        <th
          v-for="header in headerGroup.headers"
          :key="header.id"
          class="table-header-item"
          :style="{
            width: `${header.column.getSize()}px`,
          }"
        >
          <FlexRender
            v-if="header.column.columnDef.header"
            :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </th>
      </tr>
    </template>

    <Tr
      v-for="row in table.getCoreRowModel().rows"
      :key="row.id"
      class="relative group"
    >
      <DashboardUsersTabularItem
        :row="row"
        :user="row.original" :settings="settings"
      />
    </Tr>

    <infinite-scroll
      :on-infinite="dashboardUsers.fetchUsers"
      :state="dashboardUsers.state"
    />
  </Table>
</template>

<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  createColumnHelper,
} from "@tanstack/vue-table";
import type { IUser } from "@logchimp/types";

import DashboardUsersTabularItem from "./TabularItem/TabularItem.vue";
import Table from "../../../../components/ui/Table/Table.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import { useSettingStore } from "../../../../store/settings";
import { useDashboardUsers } from "../../../../store/dashboard/users";

const { settings } = useSettingStore();
const dashboardUsers = useDashboardUsers();

const columnHelper = createColumnHelper<IUser>();

const columns = [
  columnHelper.display({
    id: "avatar",
    enableHiding: true,
    size: 64,
    header: () => null,
    enableResizing: false,
  }),
  columnHelper.accessor("name", {
    header: "name",
    enableSorting: true,
  }),
  columnHelper.display({
    id: "roles",
    size: 350,
    header: "roles",
  }),
  columnHelper.display({
    id: "post_count",
    size: 30,
    header: () => "Posts",
  }),
  columnHelper.display({
    id: "votes_count",
    size: 30,
    header: () => "Votes",
  }),
  columnHelper.display({
    id: "more",
    enableHiding: !settings.developer_mode,
    header: () => null,
    size: 64,
    enableResizing: false,
  }),
];

const table = useVueTable({
  get data() {
    return dashboardUsers.users;
  },
  getRowId: (originalRow) => originalRow.userId,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

console.log(table.getCoreRowModel().rows[0]);

defineOptions({
  name: "DashboardUsersTabularView",
});
</script>
