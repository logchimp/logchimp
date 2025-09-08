<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>
          Roadmaps
        </BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :disabled="createRoadmapButtonDisabled"
      :loading="createRoadmapButtonLoading"
      @click="createRoadmapHandler"
    >
      <!-- <div>-->
      <!--   <PhCrownSimple :size="32" color="#d8f218" weight="fill" />-->
      <!-- </div>-->
      Create roadmap
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="table-container">
      <div class="table-header">
        <div class="w-14" />
        <div class="table-header-item flex-1">
          name
        </div>
        <div class="table-header-item" />
      </div>
      <div class="table-body">
        <draggable
          :list="dashboardRoadmaps.roadmaps"
          group="roadmap"
          handle=".grip-handler"
					item-key="roadmap"
          :move="moveItem"
          @start="drag = true"
          @end="initialiseSort"
        >
          <template #item="{ element: roadmap }">
            <DashboardRoadmapTabularItem :roadmap="roadmap" />
					</template>
        </draggable>

        <infinite-scroll
          :on-infinite="dashboardRoadmaps.fetchRoadmaps"
          :state="dashboardRoadmaps.state"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import draggable from "vuedraggable";
import { useHead } from "@vueuse/head";
import type { ISortRoadmapRequestBody } from "@logchimp/types";
// import { PhCrownSimple } from "@phosphor-icons/vue";

// modules
import { router } from "../../../../router";
import { useUserStore } from "../../../../store/user";
import { useDashboardRoadmaps } from "../../../store/dashboard/roadmaps";
import { createRoadmap, sortRoadmap } from "../../../modules/roadmaps";
import type { VueDraggableEvent } from "../../../lib/vuedraggable/types";

// components
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import Button from "../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardRoadmapTabularItem from "../../../components/dashboard/roadmap/TabularItem/TabularItem.vue";

const { permissions } = useUserStore();
const dashboardRoadmaps = useDashboardRoadmaps();

const createRoadmapButtonLoading = ref(false);
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

const createRoadmapButtonDisabled = computed(() => {
  const checkPermission = permissions.includes("roadmap:create");
  return !checkPermission;
});

async function createRoadmapHandler() {
  createRoadmapButtonLoading.value = true;

  try {
    const response = await createRoadmap();
    const roadmap = response.data.roadmap;

    dashboardRoadmaps.appendRoadmap(roadmap);
    router.push(`/dashboard/roadmaps/${roadmap.url}/settings`);
  } catch (err) {
    createRoadmapButtonLoading.value = false;

    console.error(err);
  }
}

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

useHead({
  title: "Roadmaps • Dashboard",
});

defineOptions({
  name: "DashboardRoadmaps",
});
</script>

<style lang='scss'>
.roadmap-table-name {
  flex: 6;
}
</style>
