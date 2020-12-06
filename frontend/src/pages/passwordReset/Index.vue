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
				<h3 class="auth-form-heading">Forget password</h3>
			</div>
			<Form v-if="!email.hide" class="auth-form">
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
				<div style="display: flex; justify-content: center;">
					<Button
						@click="forgetPassword"
						type="primary"
						:loading="buttonLoading"
					>
						Continue
					</Button>
				</div>
			</Form>
			<Form v-else>
				<p>You will receive a password reset email soon.</p>
				<br />
				<p>Follow the link in the email to reset your password.</p>
			</Form>
			<div class="auth-form-other">
				Don't have an account yet?
				<router-link to="/join">Sign up</router-link>
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { requestPasswordReset } from "../../modules/auth";

// component
import Form from "../../components/Form";
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
	name: "ForgetPassword",
	data() {
		return {
			email: {
				value: "",
				error: {
					show: false,
					message: ""
				},
				hide: false
			},
			requestPassword: false,
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
		hideEmailError(event) {
			this.email.error = event;
		},
		async forgetPassword() {
			if (this.buttonLoading) {
				return;
			}

			if (!this.email.value) {
				this.email.error.show = true;
				this.email.error.message = "Required";
				return;
			}

			this.buttonLoading = true;

			try {
				await requestPasswordReset(this.email.value);

				this.email.hide = true;
				this.email.value = "";
			} catch (error) {
				if (error.response.data.code === "USER_NOT_FOUND") {
					this.email.error.show = true;
					this.email.error.message = "User not found";
				}
			} finally {
				this.buttonLoading = false;
			}
		}
	},
	metaInfo() {
		return {
			title: "Forget password",
			meta: [
				{
					name: "og:title",
					content: `Forget password · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
