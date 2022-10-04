<template>
	<div class="auth-form">
		<div class="auth-form-header">
			<site-branding :settings="settings" />
			<h3 class="auth-form-heading">Forget password</h3>
		</div>
		<server-error v-if="serverError" @close="serverError = false" />
		<div v-if="!hideForm" class="card">
			<l-text
				v-model="email.value"
				label="Email Address"
				type="email"
				name="email"
				placeholder="Email address"
				:error="email.error"
				@keyup-enter="forgetPassword"
				@hide-error="hideEmailError"
			/>
			<div style="display: flex; justify-content: center">
				<Button type="primary" :loading="buttonLoading" @click="forgetPassword">
					Continue
				</Button>
			</div>
		</div>
		<div v-if="requestSuccess" class="card">
			<p>You will receive a password reset email soon.</p>
			<br />
			<p>Follow the link in the email to reset your password.</p>
		</div>
		<div v-if="requestError" class="card">
			<p>Something went wrong!</p>
		</div>
		<div v-if="settings.allowSignup" class="auth-form-other">
			Don't have an account yet?
			<a href="/join"> Sign up </a>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// component
import ServerError from "../../components/serverError.vue";
import LText from "../../components/ui/LText.vue";
import Button from "../../components/ui/Button.vue";
import SiteBranding from "../../components/site/SiteBranding.vue";

export default {
	name: "ForgetPassword",
	components: {
		// component
		LText,
		Button,
		ServerError,
		SiteBranding
	},
	data() {
		return {
			email: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			hideForm: false,
			requestSuccess: false,
			requestError: false,
			buttonLoading: false,
			serverError: false
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	methods: {
		hideEmailError(event) {
			this.email.error = event;
		},
		async forgetPassword() {
			if (!this.email.value) {
				this.email.error.show = true;
				this.email.error.message = "Required";
				return;
			}

			this.buttonLoading = true;

			try {
				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/auth/password/reset",
					data: {
						email: this.email.value
					}
				});

				this.hideForm = true;
				if (response.data.reset.success) {
					this.requestSuccess = true;
				} else {
					this.requestError = true;
				}
				this.buttonLoading = false;
			} catch (error) {
				if (error.response.data.code === "MAIL_CONFIG_MISSING") {
					this.serverError = true;
				}

				if (error.response.data.code === "USER_NOT_FOUND") {
					this.email.error.show = true;
					this.email.error.message = "User not found";
				}
				this.buttonLoading = false;
			}
		}
	},
	head() {
		return {
			title: `Forget password • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Forget password • ${this.settings.title}`
				}
			]
		};
	}
};
</script>
