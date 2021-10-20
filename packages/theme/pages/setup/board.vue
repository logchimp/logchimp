<template>
	<div class="auth-form">
		<div class="onboarding-header">
			<h2 class="onboarding-heading">Create a new board</h2>
			<p class="onboarding-label">
				A board is a place where people can post and vote on ideas for a
				specific topic.
			</p>
		</div>
		<div class="card">
			<l-text
				v-model="boardName.value"
				label="Name"
				type="text"
				name="Name"
				placeholder="Name of the board"
				:error="boardName.error"
				@keyup-enter="create"
				@hide-error="hideBoardNameError"
			/>
			<div style="display: flex; justify-content: center">
				<Button
					:loading="buttonLoading"
					:disabled="createBoardPermissionDisabled"
					type="primary"
					@click="create"
				>
					Create
				</Button>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// components
import LText from "../../components/ui/LText.vue";
import Button from "../../components/ui/Button.vue";

export default {
	name: "SetupBoard",
	layout: "onboarding",
	components: {
		// components
		LText,
		Button
	},
	data() {
		return {
			boardName: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			buttonLoading: false
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
		}
	},
	methods: {
		hideBoardNameError(event) {
			this.boardName.error = event;
		},
		async create() {
			if (!this.boardName.value) {
				this.boardName.error.show = true;
				this.boardName.error.message = "Required";
				return;
			}

			this.buttonLoading = true;

			try {
				const token = this.$store.getters["user/getAuthToken"];

				await this.$axios({
					method: "POST",
					url: "/api/v1/boards",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.$router.push("/dashboard");
				this.buttonLoading = false;
			} catch (error) {
				console.error(error);
				this.buttonLoading = false;
			}
		}
	},
	head() {
		return {
			title: `Create board • Onboarding • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Create board • Onboarding • ${this.settings.title}`
				}
			]
		};
	}
};
</script>
