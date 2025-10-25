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
      <Td :head="true" />
      <Td
        :head="true"
        :style="{
          width: '100px',
        }"
      />
    </template>

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

    <template #infinite-loader>
      <infinite-scroll
        :on-infinite="dashboardRoadmaps.fetchRoadmaps"
        :state="dashboardRoadmaps.state"
      />
    </template>
  </Table>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import { ref } from "vue";
import type { ISortRoadmapRequestBody } from "@logchimp/types";

import { useDashboardRoadmaps } from "../../../store/dashboard/roadmaps";
import type { VueDraggableEvent } from "../../../lib/vuedraggable/types";
import { sortRoadmap } from "../../../modules/roadmaps";

import Table from "../../../../components/ui/Table/Table.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import Td from "../../../../components/ui/Table/Td.vue";
import TabularItem from "./TabularItem/TabularItem.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";

const dashboardRoadmaps = useDashboardRoadmaps();

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
// Track UI (zero-based) indices to detect no-op drags reliably
const uiFromIndex = ref<number>(-1);
const uiToIndex = ref<number>(-1);
const hasPendingSort = ref<boolean>(false);

function resetSortState() {
  hasPendingSort.value = false;
  uiFromIndex.value = -1;
  uiToIndex.value = -1;
  sort.value = {
    from: { id: "", index: 0 },
    to: { id: "", index: 0 },
  };
}

function moveItem(
  event: VueDraggableEvent<
    ISortRoadmapRequestBody["from"],
    ISortRoadmapRequestBody["to"]
  >,
) {
  // Guard: ensure relatedContext.element exists
  if (!event.relatedContext?.element) {
    console.warn("Cannot sort: relatedContext.element is undefined");
    resetSortState();
    return false;
  }

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

  // Save UI indices (zero-based) for accurate no-op detection
  uiFromIndex.value = event.draggedContext.index;
  uiToIndex.value = event.draggedContext.futureIndex;
  hasPendingSort.value = true;
}

async function initialiseSort() {
  try {
    // If move was cancelled or we don't have fresh indices, skip
    if (!hasPendingSort.value || uiFromIndex.value < 0 || uiToIndex.value < 0) {
      return;
    }
    // Skip API call if the UI position hasn't changed
    if (uiFromIndex.value === uiToIndex.value) {
      resetSortState();
      return;
    }

    // Backfill missing IDs using current list positions (failsafe)
    const fromIdx = uiFromIndex.value;
    const toIdx = uiToIndex.value;
    const list = dashboardRoadmaps.roadmaps as unknown as Array<{ id: string }>;
    if (!sort.value.to.id && list[fromIdx]) {
      sort.value.to.id = list[fromIdx].id;
    }
    if (!sort.value.from.id && list[toIdx]) {
      sort.value.from.id = list[toIdx].id;
    }

    // Validate sort data before sending to server
    if (!sort.value.from.id || !sort.value.to.id) {
      console.error("Invalid sort data: missing roadmap IDs");
      resetSortState();
      return;
    }

    const response = await sortRoadmap(sort.value);

    if (response.status === 200) {
      // Update local store with zero-based indices captured from UI
      dashboardRoadmaps.sortRoadmap(uiFromIndex.value, uiToIndex.value);
      resetSortState();
    }
  } catch (err) {
    console.error("Error sorting roadmaps:", err);
    // Optionally, show a user-friendly error message
    // For example, using a notification or modal
  } finally {
    drag.value = false;
  }
}

defineOptions({
  name: "DashboardRoadmapTabularView",
});
</script>
