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

		<div class="form-section">
			<div class="form-columns">
				<div class="form-column">
					<l-text
						label="Name"
						placeholder="Enter board name"
						v-model="board.name"
					/>

					<color-input v-model="board.color" />
				</div>

				<div class="form-column">
					<l-text
						label="Slug"
						placeholder="Board slug url"
						v-model="board.url"
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
						label="Display on site"
						v-model="board.display"
						note="Show this board on the site"
					/>
				</div>

				<div class="form-column">
					<toggle-item
						label="View voters"
						v-model="board.view_voters"
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
	components: {
		// Breadcrumbs,
		Button,
		LText,
		ToggleItem,
		ColorInput
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
	created() {
		this.getBoard();
	},
	metaInfo() {
		return {
			title: `${this.title} · Settings · Board · Dashboard`
		};
	}
};
</script>
