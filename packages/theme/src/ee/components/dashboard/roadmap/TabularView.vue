<template>
  <license-validation-failed
    v-if="dashboardRoadmaps.error === 'LICENSE_VALIDATION_FAILED'"
    resource-type="roadmaps"
  />
  <Table v-else :disable-dividers="requireUpgrade">
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
      <Td :head="true" />
      <Td
        :head="true"
        :style="{
          width: '100px',
        }"
      />
    </template>

    <template v-if="requireUpgrade">
      <div class="pointer-events-none select-none divide-y divide-neutral-200 relative" aria-hidden="true">
        <Tr
          v-for="roadmap in EXAMPLE_ROADMAPS_DATA.slice(0, 3)"
          :key="roadmap.id"
        >
          <TabularItem :roadmap="roadmap" />
        </Tr>
        <div class="absolute inset-0 bg-linear-to-t from-white to-white/30" />
      </div>

      <EmptyScreen
        title="Roadmaps"
        description="Keep your customers up-to-date as your team releases the customer feedbacks. Upgrade to Pro plan to access this feature."
        learnMore="https://docs.logchimp.app/guide/boards"
        :border="false"
        :icon="KanbanIcon"
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
      <draggable
        :list="dashboardRoadmaps.roadmaps"
        group="roadmap"
        handle=".grip-handler"
        item-key="id"
        :move="moveItem"
        @start="drag = true"
        @end="initialiseSort"
      >
        <template #item="{ element: row }">
          <Tr>
            <TabularItem :roadmap="row" />
          </Tr>
        </template>
      </draggable>
    </template>

    <template #infinite-loader v-if="!requireUpgrade">
      <infinite-scroll
        :on-infinite="dashboardRoadmaps.fetchRoadmaps"
        :state="dashboardRoadmaps.state"
      />
    </template>
  </Table>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import { computed, ref } from "vue";
import type { ISortRoadmapRequestBody } from "@logchimp/types";
import { KanbanIcon } from "lucide-vue";

import { useDashboardRoadmaps } from "../../../store/dashboard/roadmaps";
import type {
  VueDraggableEndEvent,
  VueDraggableEvent,
} from "../../../lib/vuedraggable/types";
import { sortRoadmap } from "../../../modules/roadmaps";

import Table from "../../../../components/ui/Table/Table.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import Td from "../../../../components/ui/Table/Td.vue";
import TabularItem from "./TabularItem/TabularItem.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";
import LicenseValidationFailed from "../../../../components/LicenseValidationFailed.vue";
import Button from "../../../../components/ui/Button.vue";
import EmptyScreen from "../../../../components/EmptyScreen.vue";
import { EXAMPLE_ROADMAPS_DATA } from "./example-data.ts";

const dashboardRoadmaps = useDashboardRoadmaps();
const requireUpgrade = computed(
  () =>
    dashboardRoadmaps.state === "ERROR" &&
    dashboardRoadmaps.error === "LICENSE_INSUFFICIENT_TIER",
);

const sort = ref<ISortRoadmapRequestBody>({
  from: {
    id: "",
    index: 0,
  },
  to: {
    id: "",
    index: 0,
  },
});
const drag = ref(false);

function moveItem(
  event: VueDraggableEvent<
    ISortRoadmapRequestBody["from"],
    ISortRoadmapRequestBody["to"]
  >,
) {
  // current
  sort.value.to = {
    id: event.draggedContext.element.id,
    index: event.draggedContext.futureIndex + 1,
  };

  // replaced with
  sort.value.from = {
    id: event.relatedContext.element.id,
    index: event.draggedContext.index + 1,
  };
}

async function initialiseSort(event: VueDraggableEndEvent) {
  drag.value = false;

  // Skip API call when item is dropped at its original position or drag is canceled
  if (event.oldIndex === event.newIndex) {
    return;
  }

  try {
    const response = await sortRoadmap(sort.value);

    if (response.status === 200) {
      dashboardRoadmaps.sortRoadmap(sort.value.from.index, sort.value.to.index);
    }
  } catch (err) {
    console.error(err);
  }
}

defineOptions({
  name: "DashboardRoadmapTabularView",
});
</script>
