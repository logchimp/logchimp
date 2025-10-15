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
      Create roadmap
      <PhCrownSimple
        :size="20"
        weight="regular"
        class="fill-white"
      />
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <TabularView />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";
import { PhCrownSimple } from "@phosphor-icons/vue";

// modules
import { router } from "../../../../router";
import { useUserStore } from "../../../../store/user";
import { useDashboardRoadmaps } from "../../../store/dashboard/roadmaps";
import { createRoadmap } from "../../../modules/roadmaps";

// components
import Button from "../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import TabularView from "../../../components/dashboard/roadmap/TabularView.vue";

const { permissions } = useUserStore();
const dashboardRoadmaps = useDashboardRoadmaps();

const createRoadmapButtonLoading = ref(false);

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

useHead({
  title: "Roadmaps • Dashboard",
});

defineOptions({
  name: "DashboardRoadmaps",
});
</script>
