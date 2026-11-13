<template>
  <DashboardPageHeader>
    <template #left>
      <Breadcrumbs>
        <BreadcrumbItem>
          {{ t("roadmaps.roadmaps_title") }}
        </BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <UpgradeTooltip :has-valid-license="hasValidLicense">
      <Button
        type="primary"
        :disabled="createRoadmapButtonDisabled"
        :loading="createRoadmapButtonLoading"
        @click="createRoadmapHandler"
      >
        {{ t("roadmaps.create_roadmap_title") }}
        <LicenseCrown v-if="!hasValidLicense" />
      </Button>
    </UpgradeTooltip>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <LicenseRequired>
      <TabularView />
    </LicenseRequired>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import type { AxiosError } from "axios";
import type { components } from "@logchimp/api-ts-types";

// modules
import { router } from "../../../../router";
import { useUserStore } from "../../../../store/user";
import { useDashboardRoadmaps } from "../../../store/dashboard/roadmaps";
import { RoadmapsEE } from "../../../modules/roadmaps";
import { useSettingsEEStore } from "../../../store/settings";

// components
import Button from "../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import TabularView from "../../../components/dashboard/roadmap/TabularView.vue";
import LicenseRequired from "../../../components/LicenseRequired.vue";
import UpgradeTooltip from "../../../components/UpgradeTooltip.vue";
import LicenseCrown from "../../../components/icons/LicenseCrown.vue";
import { useAlertStore } from "../../../../store/alert.ts";

const { add: toast } = useAlertStore();
const { permissions } = useUserStore();
const dashboardRoadmaps = useDashboardRoadmaps();
const settingsEEStore = useSettingsEEStore();
const { hasValidLicense } = storeToRefs(settingsEEStore);
const { t } = useI18n();

const createRoadmapButtonLoading = ref(false);

const createRoadmapButtonDisabled = computed(() => {
  const checkPermission = permissions.includes("roadmap:create");
  return !checkPermission;
});
const roadmapEEAPI = new RoadmapsEE();

async function createRoadmapHandler() {
  createRoadmapButtonLoading.value = true;

  try {
    const response = await roadmapEEAPI.CreateRoadmap();
    const roadmap = response.roadmap;

    dashboardRoadmaps.appendRoadmap(roadmap);
    router.push(
      `/dashboard/roadmaps/${encodeURIComponent(roadmap.url)}/settings`,
    );
  } catch (error) {
    const err = error as AxiosError<
      components["schemas"]["GenericAPIErrorResponseBody"]
    >;

    toast({
      title: err.response?.data.message ?? "Failed to create roadmap",
      type: "error",
    });
  } finally {
    createRoadmapButtonLoading.value = false;
  }
}

onMounted(() => {
  settingsEEStore.getLicenseInfo();
});

useHead({
  title: () => `${t("roadmaps.roadmaps_title")} • ${t("dashboard_title")}`,
});

defineOptions({
  name: "DashboardRoadmaps",
});
</script>
