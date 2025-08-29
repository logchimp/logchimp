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
          :list="roadmaps"
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

        <infinite-scroll :on-infinite="getRoadmaps" :state="state" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import draggable from "vuedraggable";
import { useHead } from "@vueuse/head";
import type { DraggableSortFromToType, IRoadmapPrivate } from "@logchimp/types";
// import { PhCrownSimple } from "@phosphor-icons/vue";

// modules
import { router } from "../../../../router";
import { useUserStore } from "../../../../store/user";
import { getAllRoadmaps } from "../../../../modules/roadmaps";
import { createRoadmap, sortRoadmap } from "../../../modules/roadmaps";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../../../components/ui/InfiniteScroll.vue";
import Button from "../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardRoadmapTabularItem from "../../../components/dashboard/roadmap/TabularItem/TabularItem.vue";

const { permissions } = useUserStore();

const roadmaps = ref<IRoadmapPrivate[]>([]);
const currentCursor = ref<string | undefined>();
const hasNextPage = ref<boolean>(false);

const createRoadmapButtonLoading = ref(false);
const sort = ref<DraggableSortFromToType>({
  from: {
    id: "",
    index: "",
  },
  to: {
    id: "",
    index: "",
  },
});
const drag = ref(false);
const state = ref<InfiniteScrollStateType>();

const createRoadmapButtonDisabled = computed(() => {
  const checkPermission = permissions.includes("roadmap:create");
  return !checkPermission;
});

async function createRoadmapHandler() {
  createRoadmapButtonLoading.value = true;

  try {
    const response = await createRoadmap();

    const url = response.data.roadmap.url;
    router.push(`/dashboard/roadmaps/${url}/settings`);
  } catch (err) {
    createRoadmapButtonLoading.value = false;

    console.error(err);
  }
}

function moveItem(event: unknown) {
  // current
  sort.value.to = {
    // @ts-ignore
    id: event.draggedContext.element.id,
    // @ts-ignore
    index: event.draggedContext.futureIndex + 1,
  };

  // replaced with
  sort.value.from = {
    // @ts-ignore
    id: event.relatedContext.element.id,
    // @ts-ignore
    index: event.draggedContext.index + 1,
  };
}

async function initialiseSort() {
  try {
    const response = await sortRoadmap(sort.value);

    if (response.status === 200) {
      drag.value = false;
      // TODO: update cache
      // await getRoadmaps();
    }
  } catch (err) {
    console.error(err);
  } finally {
    drag.value = false;
  }
}

async function getRoadmaps() {
  if (state.value === "COMPLETED") return;

  state.value = "LOADING";

  try {
    const response = await getAllRoadmaps({
      after: currentCursor.value,
    });

    const results = response.data.results;
    const pageInfo = response.data.page_info;

    if (results.length > 0) {
      roadmaps.value.push(...results);

      currentCursor.value = pageInfo.end_cursor || undefined;
      hasNextPage.value = pageInfo.has_next_page;

      state.value = hasNextPage.value ? "LOADED" : "COMPLETED";
    } else {
      state.value = "COMPLETED";
      hasNextPage.value = false;
    }
  } catch (err) {
    console.error("Error fetching roadmaps:", err);
    state.value = "ERROR";
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
