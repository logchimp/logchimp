<template>
  <div>
    <header class="form-header">
      <div class="breadcrumbs">
        <h5 class="breadcrum-item">
          Boards
        </h5>
      </div>

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
        <div class="table-header-item boards-table-color" />
        <div class="table-header-item boards-table-name">
          name
        </div>
        <div class="table-header-item boards-table-posts">
          posts
        </div>
        <div class="table-header-item boards-table-icons" />
      </template>
			<div v-infinite-scroll="getBoards">
				<div
					v-for="(board, index) in boards"
					:key="board.boardId"
					class="table-row"
				>
					<div class="table-data boards-table-color">
						<div
							class="color-dot"
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
									class="table-data table-data-icon boards-table-icon-settings dropdown-menu-icon"
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
        <!-- <div slot="spinner" class="loader-container">
          <loader />
        </div>
        <div slot="no-more" />
        <div slot="no-results" />
        <div slot="error" /> -->
      </div>
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
import { computed, onMounted, ref } from "vue";
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
import { vInfiniteScroll } from "@vueuse/components";

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
import Button from "../../../components/Button.vue";
import Table from "../../../components/Table.vue";
import DropdownWrapper from "../../../components/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../components/dropdown/Dropdown.vue";
import DropdownItem from "../../../components/dropdown/DropdownItem.vue";
import DropdownSpacer from "../../../components/dropdown/DropdownSpacer.vue";
// import Loader from "../../../components/Loader.vue";

const { settings } = useSettingStore()
const { permissions } = useUserStore()

const createBoardButtonLoading = ref(false)
const boards = ref<any>([]);
const page = ref(1);

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
	try {
		const response = await getAllBoards({
			page: page.value,
			sort: "DESC"
		});

		if (response.data.boards.length) {
			boards.value.push(...response.data.boards);
			page.value += 1;
			// $state.loaded();
		} else {
			// $state.complete();
		}
	} catch (error) {
		console.error(error);
		// $state.error();
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

onMounted(() => getBoards());

useHead({
	title: "Boards · Dashboard"
})
</script>
