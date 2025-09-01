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
    </Button>
  </DashboardPageHeader>

	<div class="px-3 lg:px-6">
		<Table class="boards-table">
			<template #header>
				<div class="w-14" />
				<div class="table-header-item boards-table-name">name</div>
				<div class="table-header-item boards-table-posts">posts</div>
				<div class="table-header-item boards-table-icons" />
			</template>

      <div
        v-for="(board, index) in boards"
        :key="board.boardId"
        class="table-row"
      >
        <DashboardBoardsTabularItem :board="board" :index="index" />
      </div>

      <infinite-scroll :on-infinite="getBoards" :state="state" />
		</Table>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";
import type { IBoardPrivate } from "@logchimp/types";

// modules
import { router } from "../../../../router";
import { useUserStore } from "../../../../store/user";
import { getAllBoards, createBoard } from "../../../modules/boards";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../../../components/ui/InfiniteScroll.vue";
import Button from "../../../../components/ui/Button.vue";
import Table from "../../../../components/ui/Table.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardBoardsTabularItem from "../../../components/dashboard/boards/TabularItem.vue";

const { permissions } = useUserStore();

const createBoardButtonLoading = ref(false);
const boards = ref<IBoardPrivate[]>([]);
const page = ref<number>(1);
const state = ref<InfiniteScrollStateType>();

const createBoardPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("board:create");
  return !checkPermission;
});

async function createBoardHandler() {
  createBoardButtonLoading.value = true;

  try {
    const response = await createBoard({});

    console.log("response");
    console.log(response.data);

    const url = response.data.board.url;
    router.push(`/dashboard/boards/${url}/settings`);
  } catch (err) {
    console.error(err);
  } finally {
    createBoardButtonLoading.value = false;
  }
}

async function getBoards() {
  state.value = "LOADING";

  try {
    const response = await getAllBoards({
      page: page.value.toString(),
      created: "DESC",
    });

    if (response.data.boards.length) {
      boards.value.push(...response.data.boards);
      page.value += 1;
      state.value = "LOADED";
    } else {
      state.value = "COMPLETED";
    }
  } catch (error) {
    console.error(error);
    state.value = "ERROR";
  }
}

useHead({
  title: "Boards • Dashboard",
});

defineOptions({
  name: "DashboardBoards",
});
</script>

<style lang='sass'>
.boards-page-header
	display: flex
	align-items: center
	margin-bottom: 1rem

.boards-page-header-heading
	margin-bottom: 0

.boards-page-header-button
	display: flex
	margin-left: auto

.boards-table
	.boards-table-name
		flex: 6
		font-weight: 500
		padding-left: 0.5rem

	.boards-table-posts
		flex: 1
		text-align: right

	.boards-table-icons
		flex: 4
		justify-content: flex-end
</style>
