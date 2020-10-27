<template>
	<div class="auth">
		<div class="auth-form-container">
			<div class="auth-form-header">
				<router-link to="/" class="auth-form-logo site-info">
					<img
						class="site-logo"
						:src="getSiteSittings.logo"
						:alt="getSiteSittings.title"
					/>
					<h5 class="site-name">{{ getSiteSittings.title }}</h5>
				</router-link>
				<h3 class="auth-form-heading">Set new password</h3>
			</div>
			<Form class="auth-form">
				<l-text
					v-model="password.value"
					label="New password"
					type="password"
					name="Password"
					placeholder="Enter new password"
					:error="password.error"
					@keyup-enter="setPassword"
					@hide-error="hidePasswordError"
				/>
				<l-text
					v-model="confirmPassword.value"
					label="Confirm password"
					type="password"
					name="Confirm password"
					placeholder="Enter new password again"
					:error="confirmPassword.error"
					@keyup-enter="setPassword"
					@hide-error="hideConfirmPasswordError"
				/>
				<div style="display: flex; justify-content: center;">
					<Button @click="setPassword" type="primary" :loading="buttonLoading">
						Reset password
					</Button>
				</div>
			</Form>
		</div>
	</div>
</template>

<script>
// modules
import { setNewPassword } from "../../modules/auth";

// component
import Form from "../../components/Form";
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
	name: "SetNewPassword",
	data() {
		return {
			password: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			confirmPassword: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			buttonLoading: false
		};
	},
	components: {
		// component
		Form,
		LText,
		Button
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		hidePasswordError(event) {
			this.password.error = event;
		},
		hideConfirmPasswordError(event) {
			this.confirmPassword.error = event;
		},
		async setPassword() {
			if (this.buttonLoading) {
				return;
			}

			if (!(this.password.value && this.confirmPassword.value)) {
				if (!this.password.value) {
					this.password.error.show = true;
					this.password.error.message = "Required";
				}

				if (!this.confirmPassword.value) {
					this.confirmPassword.error.show = true;
					this.confirmPassword.error.message = "Required";
				}
				return;
			}

			// match password and confirm password
			if (this.password.value !== this.confirmPassword.value) {
				this.confirmPassword.error.show = true;
				this.confirmPassword.error.message = "Password doesn't match";
				return;
			}

			const resetPasswordToken = this.$route.params.token;

			this.buttonLoading = true;

			try {
				const response = await setNewPassword(
					resetPasswordToken,
					this.password.value
				);

				if (response.data.type === "success") {
					this.$route.push("/login");
				}

				this.buttonLoading = false;
			} catch (err) {
				console.error(err);

				if (err.response.data.code === "INVALID_PASSWORD_RESET_TOKEN") {
					this.$store.dispatch("alerts/add", {
						title: "Request a new password reset",
						type: "error",
						timeout: 4000
					});
				}

				if (err.response.data.code === "PASSWORD_RESET_EXPIRED") {
					this.$store.dispatch("alerts/add", {
						title: "Password reset request expired",
						type: "warning",
						timeout: 4000
					});
				}

				this.buttonLoading = false;
			}
		}
	},
	created() {
		// user already logged in
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			this.$router.push("/");
		}

		// have reset password token && reset password expires in url
		const resetPasswordToken = this.$route.query.resetPasswordToken;
		if (!resetPasswordToken) {
			this.$router.push("/forget");
		}
	},
	metaInfo() {
		return {
			title: "Set new password",
			meta: [
				{
					name: "og:title",
					content: `Set new password · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
