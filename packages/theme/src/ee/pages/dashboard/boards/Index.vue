<template>
  <DashboardPageHeader>
    <template #left>
      <Breadcrumbs>
        <BreadcrumbItem>
          {{ t("boards.boards_title") }}
        </BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <UpgradeTooltip :has-valid-license="hasValidLicense">
      <Button
        type="primary"
        :disabled="createBoardPermissionDisabled"
        :loading="createBoardButtonLoading"
        @click="createBoardHandler"
      >
        {{ t("boards.create_board_title") }}
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
import { useHead } from "@vueuse/head";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

// modules
import { router } from "../../../../router";
import { useUserStore } from "../../../../store/user";
import { BoardsEE } from "../../../modules/boards";
import { useDashboardBoards } from "../../../store/dashboard/boards";
import { useSettingsEEStore } from "../../../store/settings";

// components
import Button from "../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import LicenseRequired from "../../../components/LicenseRequired.vue";
import TabularView from "../../../components/dashboard/boards/TabularView.vue";
import UpgradeTooltip from "../../../components/UpgradeTooltip.vue";
import LicenseCrown from "../../../components/icons/LicenseCrown.vue";

const { permissions } = useUserStore();
const dashboardBoards = useDashboardBoards();
const settingsEEStore = useSettingsEEStore();
const { hasValidLicense } = storeToRefs(settingsEEStore);
const { t } = useI18n();

const createBoardButtonLoading = ref(false);
const boardsEEAPI = new BoardsEE();

const createBoardPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("board:create");
  return !checkPermission;
});

async function createBoardHandler() {
  createBoardButtonLoading.value = true;

  try {
    const response = await boardsEEAPI.CreateBoard();

    dashboardBoards.appendBoard(response.board);

    const url = response.board.url;
    router.push(`/dashboard/boards/${encodeURIComponent(url)}/settings`);
  } catch (err) {
    console.error(err);
  } finally {
    createBoardButtonLoading.value = false;
  }
}

onMounted(() => {
  settingsEEStore.getLicenseInfo();
});

useHead({
  title: `${t("boards.boards_title")} • ${t("dashboard_title")}`,
});

defineOptions({
  name: "DashboardBoards",
});
</script>
