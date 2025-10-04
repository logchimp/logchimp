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
      item-key="roadmap"
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

async function initialiseSort() {
  try {
    const response = await sortRoadmap(sort.value);

    if (response.status === 200) {
      drag.value = false;
      dashboardRoadmaps.sortRoadmap(sort.value.from.index, sort.value.to.index);
    }
  } catch (err) {
    console.error(err);
  } finally {
    drag.value = false;
  }
}

defineOptions({
  name: "DashboardRoadmapTabularView",
});
</script>
