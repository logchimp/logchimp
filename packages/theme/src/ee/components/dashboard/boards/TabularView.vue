<template>
  <license-validation-failed
    v-if="dashboardBoards.error === 'LICENSE_VALIDATION_FAILED'"
    resource-type="boards"
  />
  <Table v-else :disable-dividers="requireUpgrade">
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

    <template v-if="requireUpgrade">
      <div class="pointer-events-none select-none divide-y divide-neutral-200 relative" aria-hidden="true">
        <Tr
          v-for="board in EXAMPLE_BOARDS_DATA.slice(0, 3)"
          :key="board.boardId"
        >
          <TabularItem :board="board" />
        </Tr>
        <div class="absolute inset-0 bg-linear-to-t from-white to-white/30" />
      </div>

      <EmptyScreen
        title="Boards"
        description="Want to organize your customers feedback into groups? Upgrade to Pro plan to access this feature."
        learnMore="https://docs.logchimp.app/guide/boards"
        :border="false"
        :icon="BoxesIcon"
        padding-y="pt-0 pb-7 lg:pb-20"
      >
        <template #button>
          <Button type="primary" href="/dashboard/settings/billing">
            Upgrade
          </Button>
        </template>
      </EmptyScreen>
    </template>
    <template v-else>
      <Tr
        v-for="board in dashboardBoards.boards"
        :key="board.boardId"
      >
        <TabularItem
          :board="board"
        />
      </Tr>
    </template>

    <template #infinite-loader v-if="!requireUpgrade">
      <infinite-scroll
        :on-infinite="dashboardBoards.fetchBoards"
        :state="dashboardBoards.state"
      />
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BoxesIcon } from "lucide-vue";

import TabularItem from "./TabularItem/TabularItem.vue";
import Table from "../../../../components/ui/Table/Table.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import { useDashboardBoards } from "../../../store/dashboard/boards";
import Td from "../../../../components/ui/Table/Td.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";
import LicenseValidationFailed from "../../../../components/LicenseValidationFailed.vue";
import Button from "../../../../components/ui/Button.vue";
import EmptyScreen from "../../../../components/EmptyScreen.vue";
import { EXAMPLE_BOARDS_DATA } from "./example-data.ts";

const dashboardBoards = useDashboardBoards();
const requireUpgrade = computed(
  () =>
    dashboardBoards.state === "ERROR" &&
    dashboardBoards.error === "LICENSE_INSUFFICIENT_TIER",
);

defineOptions({
  name: "DashboardBoardsTabularView",
});
</script>
