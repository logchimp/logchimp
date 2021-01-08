<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<router-link to="/dashboard/boards" class="breadcrum-item">
					Boards
				</router-link>
				<div class="breadcrum-divider">/</div>
				<h5 class="breadcrum-item">
					{{ title }}
				</h5>
			</div>

			<Button
				@click="update"
				type="primary"
				:loading="saveButtonLoading"
				:disabled="disabled"
			>
				Save
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
import { getBoardByUrl, updateBoard } from "../../../modules/boards";

// components
import Button from "../../../components/Button";
import BoardForm from "../../../components/board/BoardForm";

export default {
	name: "BoardSettings",
	data() {
		return {
			title: "",
			board: {},
			saveButtonLoading: false
		};
	},
	components: {
		// Breadcrumbs,
		Button,
		BoardForm
	},
	computed: {
		disabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.find(item => item === "board:update");

			return !checkPermission;
		}
	},
	methods: {
		async update() {
			this.saveButtonLoading = true;
			try {
				await updateBoard({
					id: this.board.boardId,
					color: this.board.color,
					name: this.board.name,
					url: this.board.url,
					view_voters: this.board.view_voters
				});

				this.$router.push("/dashboard/boards");
			} catch (error) {
				console.error(error);
			} finally {
				this.saveButtonLoading = false;
			}
		},
		async getBoard() {
			try {
				const url = this.$route.params.url;
				const response = await getBoardByUrl(url);

				this.board = response.data.board;
				this.title = response.data.board.name;
			} catch (error) {
				console.error(error);
			}
		}
	},
	created() {
		this.getBoard();
	}
};
</script>
