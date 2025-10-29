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
      @start="onDragStart"
      @end="onDragEnd"
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

const drag = ref(false);

function onDragStart() {
  drag.value = true;
}

async function onDragEnd(event: any) {
  try {
    const roadmapId = dashboardRoadmaps.roadmaps[event.newIndex].id;
    const roadmapFromArrayIndex = event.oldIndex;
    const roadmapToArrayIndex = event.newIndex;

    // incomplete drag
    if (roadmapFromArrayIndex === roadmapToArrayIndex) return;

    const prevRoadmap =
      roadmapToArrayIndex > 0
        ? dashboardRoadmaps.roadmaps[roadmapToArrayIndex - 1]
        : null;
    const nextRoadmap =
      roadmapToArrayIndex < dashboardRoadmaps.roadmaps.length - 1
        ? dashboardRoadmaps.roadmaps[roadmapToArrayIndex + 1]
        : null;

    const response = await sortRoadmap({
      id: roadmapId,
      prevRoadmapId: prevRoadmap?.id,
      nextRoadmapId: nextRoadmap?.id,
    });

    if (response.status === 200) {
      dashboardRoadmaps.updateRoadmapIndex(roadmapId, response.data.index);
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
