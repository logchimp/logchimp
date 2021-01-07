<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<router-link to="/dashboard/boards" class="breadcrum-item">
					Boards
				</router-link>
				<div class="breadcrum-divider">/</div>
				<div class="breadcrum-item">
					Create board
				</div>
			</div>

			<Button
				@click="createBoard"
				type="primary"
				:loading="buttonLoading"
				:disabled="disabled"
			>
				Create
			</Button>
		</header>

		<board-form
			:name="board.name"
			:url="board.url"
			:color="board.color"
			:view-voters="board.view_voters"
			@update-name="value => (board.name = value)"
			@update-url="value => (board.url = value)"
			@update-color="value => (board.color = value)"
			@update-view-voters="value => (board.view_voters = value)"
		/>
	</div>
</template>

<script>
// modules
import { createBoard } from "../../../modules/boards";

// components
import BoardForm from "../../../components/board/BoardForm";
import Button from "../../../components/Button";

export default {
	name: "DashboardCreateBoard",
	data() {
		return {
			board: {
				name: "",
				url: "",
				color: "",
				view_voters: false
			},
			buttonLoading: false
		};
	},
	components: {
		BoardForm,
		Button
	},
	computed: {
		disabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.find(item => item === "board:create");

			return !checkPermission;
		},
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		async createBoard() {
			this.buttonLoading = true;
			try {
				await createBoard(this.board);
				this.$router.push("/dashboard/boards");
			} catch (error) {
				console.error(error);
			} finally {
				this.buttonLoading = false;
			}
		}
	},
	metaInfo() {
		return {
			title: "Create board · Dashboard",
			meta: [
				{
					name: "og:title",
					content: `Create board · Dashboard · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
