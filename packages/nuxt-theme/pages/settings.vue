<template>
	<div>
		<h4 class="form-header">Account settings</h4>
		<div v-if="!user.loading">
			<server-error v-if="serverError" @close="serverError = false" />
			<div v-if="!userIsVerified" class="user-settings-verification">
				<div class="user-settings-verification-content">
					<alert-icon />
					<div class="user-settings-verification-text">
						<h6>Email verification</h6>
						<p>
							We’ve sent you an verification email. Please follow the
							instructions in the email.
						</p>
					</div>
				</div>

				<Button
					type="background"
					:loading="resendVerificationEmailButtonLoading"
					@click="resendEmail"
				>
					Resend
				</Button>
			</div>
			<l-text
				v-model="user.name.value"
				label="Name"
				type="text"
				name="Name"
				placeholder="Full name"
				class="user-settings-name-item"
				@keyup-enter="updateSettings"
			/>
			<l-text
				v-model="user.username.value"
				label="Username"
				type="text"
				name="Username"
				placeholder="Username"
				:disabled="true"
			/>
			<l-text
				v-model="user.email.value"
				label="Email Address"
				type="text"
				name="Email Address"
				placeholder="Email address"
				:disabled="true"
			/>
			<div style="display: flex; justify-content: flex-start">
				<Button
					type="primary"
					:loading="updateUserButtonLoading"
					@click="updateSettings"
				>
					Update
				</Button>
			</div>
		</div>
		<div v-else class="loader-container">
			<loader />
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import { AlertTriangle as AlertIcon } from "lucide-vue";

// components
import Loader from "../components/ui/Loader.vue";
import ServerError from "../components/serverError.vue";
import LText from "../components/ui/LText.vue";
import Button from "../components/ui/Button.vue";

import tokenError from "../mixins/tokenError";

export default {
	name: "UserSettings",
	layout: "viewer",
	mixins: [tokenError],
	components: {
		// components
		Loader,
		ServerError,
		LText,
		Button,

		// icons
		AlertIcon
	},
	data() {
		return {
			user: {
				loading: false,
				name: {
					value: ""
				},
				username: {
					value: ""
				},
				email: {
					value: ""
				},
				isVerified: false
			},
			serverError: false,
			resendVerificationEmailButtonLoading: false,
			updateUserButtonLoading: false
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		userIsVerified() {
			return this.user.isVerified;
		}
	},
	created() {
		const userId = this.$store.getters["user/getUserId"];

		if (userId) {
			this.getUser();
		} else {
			this.$router.push({
				path: "/login",
				query: {
					redirect: "/settings"
				}
			});
		}
	},
	methods: {
		async getUser() {
			this.user.loading = true;

			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/users/profile",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.user.name.value = response.data.user.name;
				this.user.username.value = response.data.user.username;
				this.user.email.value = response.data.user.email;
				this.user.isVerified = response.data.user.isVerified;
				this.user.loading = false;
			} catch (error) {
				this.user.loading = false;
				this.tokenError(error);
			}
		},
		async updateSettings() {
			this.updateUserButtonLoading = true;

			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "patch",
					url: "/api/v1/users/profile",
					data: {
						name: this.user.name.value
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.user.name.value = response.data.user.name;

				this.$store.dispatch("user/updateUserSettings", {
					name: response.data.user.name
				});

				this.updateUserButtonLoading = false;
			} catch (error) {
				this.updateUserButtonLoading = false;
				this.tokenError(error);
			}
		},
		async resendEmail() {
			this.resendVerificationEmailButtonLoading = true;

			try {
				const email = this.user.email.value;

				await this.$axios({
					method: "POST",
					url: "/api/v1/auth/email/verify",
					data: {
						email
					}
				});
				this.resendVerificationEmailButtonLoading = false;
			} catch (error) {
				if (error.response.data.code === "MAIL_CONFIG_MISSING") {
					this.serverError = true;
				}

				console.error(error);
				this.resendVerificationEmailButtonLoading = false;
			}
		}
	},
	head() {
		return {
			title: `Settings • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Settings • ${this.settings.title}`
				}
			]
		};
	}
};
</script>

<style lang='sass'>
.user-settings-verification
	border: 1px solid var(--color-gray-90)
	border-radius: var(--border-radius-default)
	padding: 1rem 1.5rem
	margin-bottom: 2rem

	.button
		margin-left: auto

.user-settings-verification, .user-settings-verification-content
	display: flex
	align-items: center

.user-settings-verification-content svg
	margin-right: 1rem
	stroke: var(--color-color-warning)

.user-settings-verification-text
	display: flex
	flex-direction: column

	h6
		margin-bottom: 0.25rem

	p
		font-size: 0.875rem
</style>
