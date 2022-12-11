<template>
	<div>
		<header class="form-header">
			<breadcrumbs>
				<h5 class="breadcrum-item">Boards</h5>
			</breadcrumbs>

			<Button
				type="primary"
				:disabled="createBoardPermissionDisabled"
				:loading="createBoardButtonLoading"
				@click="createBoardHandler"
			>
				Create board
			</Button>
		</header>

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
        <div class="flex justify-center w-14">
          <div
            class="w-3 h-3 rounded-full"
            :style="{
              backgroundColor: `#${board.color}`
            }"
          />
        </div>
        <div class="table-data boards-table-name">
          {{ board.name }}
        </div>
        <div class="table-data boards-table-posts">
          {{ board.post_count }}
        </div>
        <div class="table-icon-group boards-table-icons">
          <router-link
            :to="`/boards/${board.url}`"
            class="table-data table-data-icon boards-table-icon-link"
          >
            <link-icon />
          </router-link>
          <div class="table-data table-data-icon">
            <eye-icon v-if="board.display" />
            <eye-off-icon v-else />
          </div>
          <dropdown-wrapper>
            <template #toggle>
              <div
                class="
                  table-data table-data-icon
                  boards-table-icon-settings
                  dropdown-menu-icon
                "
              >
                <more-icon />
              </div>
            </template>
            <template #default="dropdown">
              <dropdown v-if="dropdown.active" class="sw">
                <dropdown-item
                  @click="
                    router.push(`/dashboard/boards/${board.url}/settings`)
                  "
                >
                  <template #icon>
                    <settings-icon />
                  </template>
                  Settings
                </dropdown-item>
                <dropdown-item
                  v-if="settings.developer_mode"
                  @click="useCopyText(board.boardId)"
                >
                  <template #icon>
                    <copy-icon />
                  </template>
                  Copy ID
                </dropdown-item>
                <dropdown-spacer />
                <dropdown-item
                  :disabled="deleteBoardPermissionDisabled"
                  class="color-danger"
                  @click="deleteBoardHandler(board.boardId, index)"
                >
                  <template #icon>
                    <delete-icon />
                  </template>
                  Delete
                </dropdown-item>
              </dropdown>
            </template>
          </dropdown-wrapper>
        </div>
      </div>

      <infinite-scroll @infinite="getBoards" :state="state" />
		</Table>
	</div>
</template>

<script lang="ts">
export default {
	name: "DashboardBoards",
}
</script>

<script setup lang="ts">
// packages
import { computed, ref } from "vue";
import {
  Link as LinkIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  MoreHorizontal as MoreIcon,
  Clipboard as CopyIcon,
  Trash2 as DeleteIcon,
  Settings as SettingsIcon
} from "lucide-vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../../../router";
import { useSettingStore } from "../../../store/settings";
import { useUserStore } from "../../../store/user";
import {
  getAllBoards,
  createBoard,
  deleteBoard
} from "../../../modules/boards";
import { useCopyText } from "../../../hooks";

// components
import InfiniteScroll, { InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue";
import Button from "../../../components/ui/Button.vue";
import Table from "../../../components/ui/Table.vue";
import DropdownWrapper from "../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../components/ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "../../../components/ui/dropdown/DropdownSpacer.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";

const { settings } = useSettingStore()
const { permissions } = useUserStore()

const createBoardButtonLoading = ref(false)
const boards = ref<any>([]);
const page = ref<number>(1);
const state = ref<InfiniteScrollStateType>()

const createBoardPermissionDisabled = computed(() => {
	const checkPermission = permissions.includes("board:create");
	return !checkPermission;
})

const deleteBoardPermissionDisabled = computed(() => {
	const checkPermission = permissions.includes("board:destroy");
	return !checkPermission;
})

async function createBoardHandler() {
	createBoardButtonLoading.value = true;

	try {
		const response = await createBoard({});

		const url = response.data.board.url;
		router.push(`/dashboard/boards/${url}/settings`);
	} catch (err) {
		console.error(err);
	} finally {
		createBoardButtonLoading.value = false;
	}
}

async function getBoards() {
  state.value = "LOADING"

	try {
		const response = await getAllBoards({
			page: page.value,
			sort: "DESC"
		});

		if (response.data.boards.length) {
			boards.value.push(...response.data.boards);
			page.value += 1;
			state.value = "LOADED"
		} else {
			state.value = "COMPLETED"
		}
	} catch (error) {
		console.error(error);
		state.value = "ERROR"
	}
}

async function deleteBoardHandler(id: string, index: number) {
	try {
		const response = await deleteBoard(id);

		if (response.status === 204) {
			boards.splice(index, 1);
			console.log(`[Dashboard] Delete board (${id})`);
		}
	} catch (error) {
		console.error(error);
	}
}

useHead({
	title: "Boards • Dashboard"
})
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
