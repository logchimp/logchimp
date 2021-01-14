<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<router-link to="/dashboard/boards" class="breadcrum-item">
					Boards
				</router-link>
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
			<template v-slot:header>
				<div class="table-header-item boards-table-color"></div>
				<div class="table-header-item boards-table-name">
					name
				</div>
				<div class="table-header-item boards-table-posts">
					posts
				</div>
				<div class="table-header-item boards-table-icons"></div>
			</template>
			<div v-for="board in boards" :key="board.boardId" class="table-row">
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
						:to="`/board/${board.url}`"
						class="table-data table-data-icon boards-table-icon-link"
					>
						<link-icon />
					</router-link>
					<div class="table-data table-data-icon">
						<eye-icon v-if="board.display" />
						<eye-off-icon v-else />
					</div>
					<router-link
						:to="`/dashboard/board/${board.url}/settings`"
						class="table-data table-data-icon boards-table-icon-settings"
					>
						<settings-icon />
					</router-link>
				</div>
			</div>
			<infinite-loading @infinite="getBoards">
				<div class="loader-container" slot="spinner"><loader /></div>
				<div slot="no-more"></div>
				<div slot="no-results"></div>
				<div slot="error"></div>
			</infinite-loading>
		</Table>
	</div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getAllBoards, createBoard } from "../../modules/boards";

// components
import Button from "../../components/Button";
import Table from "../../components/Table";
import Loader from "../../components/Loader";

// icons
import LinkIcon from "../../components/icons/Link";
import EyeIcon from "../../components/icons/Eye";
import EyeOffIcon from "../../components/icons/EyeOff";
import SettingsIcon from "../../components/icons/Settings";

export default {
	name: "DashboardBoards",
	data() {
		return {
			createBoardButtonLoading: false,
			boards: [],
			page: 1
		};
	},
	components: {
		// package
		InfiniteLoading,

		// component
		Button,
		Table,
		Loader,

		// icons
		LinkIcon,
		EyeIcon,
		EyeOffIcon,
		SettingsIcon
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		},
		createBoardPermissionDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const createBoardPermission = permissions.find(
				item => item === "board:create"
			);

			return !createBoardPermission;
		}
	},
	methods: {
		async createBoard() {
			this.createBoardButtonLoading = true;
			try {
				const response = await createBoard();

				const url = response.data.board.url;
				this.$router.push(`/dashboard/board/${url}/settings`);
			} catch (err) {
				console.error(err);
			} finally {
				this.createBoardButtonLoading = false;
			}
		},
		async getBoards($state) {
			try {
				const response = await getAllBoards(this.page, null, "desc");

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
		}
	},
	metaInfo() {
		return {
			title: `Boards · Dashboard`,
			meta: [
				{
					name: "og:title",
					content: `Boards · Dashboard · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
