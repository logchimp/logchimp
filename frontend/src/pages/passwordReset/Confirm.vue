<template>
	<div class="auth">
		<div class="auth-form-container">
			<div v-if="!loading">
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
				<div v-if="!invalidRequest">
					<Form v-if="!isSuccess" class="auth-form">
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
							<Button
								@click="setPassword"
								type="primary"
								:loading="buttonLoading"
							>
								Reset password
							</Button>
						</div>
					</Form>
					<Form v-else class="auth-form">
						<success-icon fill="#64B285" stroke="white" />
						<div>
							You've successful changed your password. You may close this window.
						</div>
					</Form>
				</div>
				<Form v-else class="auth-form">
					<error-icon fill="#DE544E" stroke="white" />
					<div>
						Invalid or expired password reset link.
					</div>
				</Form>
			</div>
			<div v-else>
				<div class="loader-container">
					<loader />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { validateResetPasswordToken, setNewPassword } from "../../modules/auth";

// component
import Loader from "../../components/Loader";
import Form from "../../components/Form";
import LText from "../../components/input/LText";
import Button from "../../components/Button";

// icons
import SuccessIcon from "../../components/icons/Success";
import ErrorIcon from "../../components/icons/Error";

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
			buttonLoading: false,
			loading: true,
			isSuccess: false,
			invalidRequest: false
		};
	},
	components: {
		// component
		Loader,
		Form,
		LText,
		Button,

		// icons
		SuccessIcon,
		ErrorIcon
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
		async validateToken() {
			try {
				const token = this.$route.query.token;
				await validateResetPasswordToken(token);
			} catch (error) {
				this.invalidRequest = true;
			} finally {
				this.loading = false;
			}
		},
		async setPassword() {
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

			const token = this.$route.query.token;
			this.buttonLoading = true;

			try {
				await setNewPassword(token, this.password.value);

				this.isSuccess = true;
				this.buttonLoading = false;
			} catch (err) {
				this.invalidRequest = true;
			}
		}
	},
	created() {
		// have reset password token
		const token = this.$route.query.token;

		if (!token) {
			this.loading = false;
			this.invalidRequest = true;
			return;
		}

		// validate reset password token
		this.validateToken();
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
