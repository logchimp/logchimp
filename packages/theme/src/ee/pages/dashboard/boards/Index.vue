<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Boards</BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :disabled="createBoardPermissionDisabled"
      :loading="createBoardButtonLoading"
      @click="createBoardHandler"
    >
      Create board
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
import { createBoard } from "../../../modules/boards";
import { useDashboardBoards } from "../../../store/dashboard/boards";

// components
import Button from "../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import TabularView from "../../../components/dashboard/boards/TabularView.vue";

const { permissions } = useUserStore();
const dashboardBoards = useDashboardBoards();

const createBoardButtonLoading = ref(false);

const createBoardPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("board:create");
  return !checkPermission;
});

async function createBoardHandler() {
  createBoardButtonLoading.value = true;

  try {
    const response = await createBoard({});

    dashboardBoards.appendBoard(response.data.board);

    const url = response.data.board.url;
    router.push(`/dashboard/boards/${url}/settings`);
  } catch (err) {
    console.error(err);
  } finally {
    createBoardButtonLoading.value = false;
  }
}

useHead({
  title: "Boards • Dashboard",
});

defineOptions({
  name: "DashboardBoards",
});
</script>
