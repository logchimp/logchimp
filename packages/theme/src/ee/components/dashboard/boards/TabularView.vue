<template>
  <Table>
    <template #header>
      <Td :head="true" />
      <Td
        :head="true"
        :style="{
          minWidth: '350px',
        }"
        class="flex-1"
      >
        Name
      </Td>
      <Td
        :style="{
          width: '100px',
        }"
        :head="true"
      >
        Posts
      </Td>
      <Td
        :style="{
          width: '50px',
        }"
      />
      <Td
        :head="true"
        :style="{
          width: '40px',
        }"
      />
    </template>

    <Tr
      v-for="board in dashboardBoards.boards"
      :key="board.boardId"
    >
      <TabularItem
        :board="board"
      />
    </Tr>

    <template #infinite-loader>
      <infinite-scroll
        :on-infinite="dashboardBoards.fetchBoards"
        :state="dashboardBoards.state"
      />
    </template>
  </Table>
</template>

<script setup lang="ts">
import TabularItem from "./TabularItem/TabularItem.vue";
import Table from "../../../../components/ui/Table/Table.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import { useDashboardBoards } from "../../../store/dashboard/boards";
import Td from "../../../../components/ui/Table/Td.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";

const dashboardBoards = useDashboardBoards();
</script>
