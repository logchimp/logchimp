<template>
	<div>
		<div class="boards-page-header">
			<h4 class="boards-page-header-heading">Boards</h4>
			<div class="boards-page-header-button">
				<Button
					type="primary"
					:disabled="createBoardPermissionDisabled"
					@click="createBoard"
				>
					Create board
				</Button>
			</div>
		</div>

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
						class="board-color"
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
					<!-- <div class="table-data table-data-icon boards-table-icon-settings">
						<settings-icon />
					</div> -->
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
import { getAllBoards } from "../../modules/boards";

// components
import Button from "../../components/Button";
import Table from "../../components/Table";
import Loader from "../../components/Loader";

// icons
import LinkIcon from "../../components/icons/Link";
// import SettingsIcon from "../../components/icons/Settings";

export default {
	name: "DashboardBoards",
	data() {
		return {
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
		LinkIcon
		// SettingsIcon
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
		createBoard() {
			this.$router.push("/dashboard/boards/create");
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
