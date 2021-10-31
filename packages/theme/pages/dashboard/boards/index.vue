<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<h5 class="breadcrum-item">Boards</h5>
			</div>

			<Button
				type="primary"
				:disabled="createBoardPermissionDisabled"
				:loading="createBoardButtonLoading"
				@click="createBoard"
			>
				Create board
			</Button>
		</header>

		<Table class="boards-table">
			<template #header>
				<div class="table-header-item boards-table-color" />
				<div class="table-header-item boards-table-name">name</div>
				<div class="table-header-item boards-table-posts">posts</div>
				<div class="table-header-item boards-table-icons" />
			</template>
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
					<a
						:href="`/boards/${board.url}`"
						class="table-data table-data-icon boards-table-icon-link"
					>
						<link-icon />
					</a>
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
										$router.push(`/dashboard/boards/${board.url}/settings`)
									"
								>
									<template #icon>
										<settings-icon />
									</template>
									Settings
								</dropdown-item>
								<dropdown-item
									v-if="isDeveloperMode"
									@click="copyText(board.boardId)"
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
									@click="deleteBoard(board.boardId, index)"
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
			<client-only>
				<infinite-loading @infinite="getBoards">
					<div slot="spinner" class="loader-container">
						<loader />
					</div>
					<div slot="no-more" />
					<div slot="no-results" />
					<div slot="error" />
				</infinite-loading>
			</client-only>
		</Table>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import {
	Link as LinkIcon,
	Eye as EyeIcon,
	EyeOff as EyeOffIcon,
	MoreHorizontal as MoreIcon,
	Clipboard as CopyIcon,
	Trash2 as DeleteIcon,
	Settings as SettingsIcon
} from "lucide-vue";
import InfiniteLoading from "vue-infinite-loading";

// components
import Button from "../../../components/ui/Button.vue";
import Table from "../../../components/ui/Table.vue";
import DropdownWrapper from "../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../components/ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "../../../components/ui/dropdown/DropdownSpacer.vue";
import Loader from "../../../components/ui/Loader.vue";

export default {
	name: "DashboardBoards",
	layout: "dashboard",
	components: {
		// package
		InfiniteLoading,

		// component
		Button,
		Table,
		DropdownWrapper,
		Dropdown,
		DropdownItem,
		DropdownSpacer,
		Loader,

		// icons
		LinkIcon,
		EyeIcon,
		EyeOffIcon,
		MoreIcon,
		CopyIcon,
		SettingsIcon,
		DeleteIcon
	},
	data() {
		return {
			createBoardButtonLoading: false,
			boards: [],
			page: 1
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		createBoardPermissionDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("board:create");
			return !checkPermission;
		},
		deleteBoardPermissionDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("board:destroy");
			return !checkPermission;
		},
		isDeveloperMode() {
			return this.$store.getters["settings/get"].developer_mode;
		}
	},
	methods: {
		async createBoard() {
			this.createBoardButtonLoading = true;
			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/boards",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const url = response.data.board.url;
				this.$router.push(`/dashboard/boards/${url}/settings`);
				this.createBoardButtonLoading = false;
			} catch (err) {
				console.error(err);
				this.createBoardButtonLoading = false;
			}
		},
		async getBoards($state) {
			try {
				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/boards/get",
					params: {
						page: this.page,
						limit: null,
						created: "DESC"
					}
				});

				if (response.data.boards.length) {
					this.boards.push(...response.data.boards);
					this.page += 1;
					$state.loaded();
				} else {
					$state.complete();
				}
			} catch (error) {
				console.error(error);
				$state.error();
			}
		},
		async deleteBoard(id, index) {
			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "DELETE",
					url: "/api/v1/boards",
					data: {
						id
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				if (response.status === 204) {
					this.boards.splice(index, 1);
					console.log(`[Dashboard] Delete board (${id})`);
				}
			} catch (error) {
				console.error(error);
			}
		},
		copyText(text) {
			navigator.clipboard
				.writeText(text)
				.then()
				.catch((err) => console.log(err));
		}
	},
	head() {
		return {
			title: `Boards • Dashboard • ${this.settings.title}`
		};
	}
};
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
	.boards-table-color
		flex: 0.5
		padding-right: 0.5rem

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
