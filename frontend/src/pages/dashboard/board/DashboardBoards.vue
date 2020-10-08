<template>
	<div>
		<div class="boards-page-header">
			<h4 class="boards-page-header-heading">Boards</h4>
			<div class="boards-page-header-button">
				<Button type="primary" @click="createBoard">
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
			<router-link
				:to="`/dashboard/board/${board.url}`"
				v-for="board in boards"
				:key="board.boardId"
				class="table-row"
			>
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
					{{ board.posts }}
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
			</router-link>
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
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

// components
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import Loader from "../../../components/Loader";

// icons
import LinkIcon from "../../../components/icons/Link";
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
		}
	},
	methods: {
		createBoard() {
			this.$router.push("/dashboard/create-board");
		},
		getBoards($state) {
			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/boards`,
				params: {
					page: this.page,
					created: "desc"
				}
			})
				.then(response => {
					if (response.data.boards.length) {
						this.boards.push(...response.data.boards);
						this.page += 1;
						$state.loaded();
					} else {
						$state.complete();
					}
				})
				.catch(error => {
					console.error(error);
					$state.error();
				});
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
