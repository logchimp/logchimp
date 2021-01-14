<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<router-link to="/dashboard/boards" class="breadcrum-item">
					Boards
				</router-link>
				<div class="breadcrum-divider">
					/
				</div>
				<h5 class="breadcrum-item">
					{{ title }}
				</h5>
			</div>

			<Button
				type="primary"
				:loading="saveButtonLoading"
				:disabled="disabled"
				@click="update"
			>
				Save
			</Button>
		</header>

		<div class="form-section">
			<div class="form-columns">
				<div class="form-column">
					<l-text
						v-model="board.name"
						label="Name"
						placeholder="Enter board name"
					/>

					<color-input v-model="board.color" />
				</div>

				<div class="form-column">
					<l-text
						v-model="board.url"
						label="Slug"
						placeholder="Board slug url"
						:description="slimUrl"
					/>
				</div>
			</div>
		</div>

		<div class="form-section">
			<h6 class="form-section-title">
				Privacy
			</h6>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item
						v-model="board.display"
						label="Display on site"
						note="Show this board on the site"
					/>
				</div>

				<div class="form-column">
					<toggle-item
						v-model="board.view_voters"
						label="View voters"
						note="Show people who vote the post"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { getBoardByUrl, updateBoard } from "../../../modules/boards";

// components
import Button from "../../../components/Button";
import LText from "../../../components/input/LText";
import ToggleItem from "../../../components/input/ToggleItem";
import ColorInput from "../../../components/ColorInput";

export default {
	name: "BoardSettings",
	components: {
		Button,
		LText,
		ToggleItem,
		ColorInput
	},
	data() {
		return {
			title: "",
			board: {
				name: "",
				url: "",
				color: "",
				view_voters: false,
				display: false
			},
			saveButtonLoading: false
		};
	},
	computed: {
		disabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.find(item => item === "board:update");

			return !checkPermission;
		},
		slimUrl() {
			return this.board.url
				.replace(/[^\w]+/gi, "-")
				.trim()
				.toLowerCase();
		},
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	created() {
		this.getBoard();
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
					view_voters: this.board.view_voters,
					display: this.board.display
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
	metaInfo() {
		return {
			title: `${this.title} · Settings · Board · Dashboard`
		};
	}
};
</script>
