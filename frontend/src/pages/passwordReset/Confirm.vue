<template>
	<div class="auth-form">
		<div>
			<div class="auth-form-header">
				<router-link to="/" class="auth-form-logo site-info">
					<img
						class="site-logo"
						:src="getSiteSittings.logo"
						:alt="getSiteSittings.title"
					>
					<h5 class="site-name">
						{{ getSiteSittings.title }}
					</h5>
				</router-link>
				<h3 class="auth-form-heading">
					Set new password
				</h3>
			</div>
			<div v-if="validToken.success">
				<div v-if="!changePassword.success" class="card">
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
							type="primary"
							:loading="buttonLoading"
							@click="setPassword"
						>
							Reset password
						</Button>
					</div>
				</div>
				<div v-else class="card">
					<success-icon color="#64B285" />
					<div>
						You've successful changed your password. You may close this window.
					</div>
				</div>
			</div>
		</div>
		<div v-if="validToken.error || changePassword.error" class="card">
			<error-icon color="#DE544E" />
			<div>
				Invalid or expired password reset link.
			</div>
		</div>
		<div v-if="validToken.loading" class="card">
			<div class="loader-container">
				<loader />
			</div>
		</div>
	</div>
</template>

<script>
// packages
import { CheckCircle as SuccessIcon, XCircle as ErrorIcon } from "lucide-vue";

// modules
import { validateResetPasswordToken, setNewPassword } from "../../modules/auth";

// component
import Loader from "../../components/Loader";
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
	name: "SetNewPassword",
	components: {
		// component
		Loader,
		LText,
		Button,

		// icons
		SuccessIcon,
		ErrorIcon
	},
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
			validToken: {
				loading: true,
				success: false,
				error: false
			},
			changePassword: {
				success: false,
				error: false
			},
			buttonLoading: false
		};
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	created() {
		// validate reset password token
		this.validateToken();
	},
	methods: {
		hidePasswordError(event) {
			this.password.error = event;
		},
		hideConfirmPasswordError(event) {
			this.confirmPassword.error = event;
		},
		async validateToken() {
			// have reset password token
			const token = this.$route.query.token;

			if (!token) {
				this.validToken.loading = false;
				this.validToken.error = true;
				return;
			}

			try {
				const response = await validateResetPasswordToken(token);

				if (response.data.reset.valid) {
					this.validToken.loading = false;
					this.validToken.success = true;
				}
			} catch (error) {
				this.validToken.loading = false;
				this.validToken.error = true;
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
				const response = await setNewPassword(token, this.password.value);

				if (response.data.reset.success) {
					this.changePassword.success = true;
				}
			} catch (err) {
				this.changePassword.error = true;
			} finally {
				this.buttonLoading = false;
				// this.$store.dispatch("user/logout");
			}
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
