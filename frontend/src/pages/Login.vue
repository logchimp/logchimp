<template>
	<div class="auth">
		<div class="auth-form-container">
			<div class="auth-form-header">
				<router-link to="/" class="auth-form-logo">
					<img src="@/assets/images/logo.svg" />
				</router-link>
				<h3 class="auth-form-heading">Welcome back!</h3>
			</div>
			<Form class="auth-form">
				<l-text
					v-model="emailAddress.value"
					label="Email Address"
					type="email"
					name="email"
					placeholder="Email address"
					:error="emailAddress.error"
					@keydown.native="emailAddressHandler"
					@keyup.native.enter="login"
				/>
				<l-text
					v-model="password.value"
					label="Password"
					type="password"
					name="password"
					placeholder="Password"
					:error="password.error"
					@keydown.native="passwordHandler"
					@keyup.native.enter="login"
				/>
				<div style="display: flex; justify-content: center;">
					<Button @click="login" type="primary">
						Login
					</Button>
				</div>
			</Form>
			<div class="auth-form-other">
				Don't have an account yet?
				<router-link to="/join">Sign up Here</router-link>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

// component
import Form from "../components/Form";
import LText from "../components/input/LText";
import Button from "../components/Button";

export default {
	name: "Login",
	data() {
		return {
			emailAddress: {
				value: "",
				error: {
					show: false,
					message: "Required"
				}
			},
			password: {
				value: "",
				error: {
					show: false,
					message: "Required"
				}
			}
		};
	},
	components: {
		// component
		Form,
		LText,
		Button
	},
	methods: {
		emailAddressHandler() {
			this.emailAddress.error.show = false;
		},
		passwordHandler() {
			this.password.error.show = false;
		},
		login() {
			if (this.emailAddress.value && this.password.value) {
				axios
					.post(`${process.env.VUE_APP_SEVER_URL}/api/v1/auth/login`, {
						emailAddress: this.emailAddress.value,
						password: this.password.value
					})
					.then(response => {
						if (response.status === 200) {
							this.$store.dispatch("alerts/add", {
								title: `Welcome back, @${response.data.user.username}!`,
								type: "success",
								timeout: 4000
							});

							this.$store.dispatch("user/login", {
								authToken: response.data.user.authToken,
								userId: response.data.user.userId,
								firstname: response.data.user.firstname,
								lastname: response.data.user.lastname,
								emailAddress: response.data.user.emailAddress,
								username: response.data.user.username,
								avatar: response.data.user.avatar,
								isVerified: response.data.user.isVerified,
								isBlocked: response.data.user.isBlocked,
								isModerator: response.data.user.isModerator,
								isOwner: response.data.user.isOwner,
								createdAt: response.data.user.createdAt,
								updatedAt: response.data.user.updatedAt
							});
							if (this.$route.query.redirect) {
								this.$router.push(this.$route.query.redirect);
							} else {
								this.$router.push("/");
							}
						}
					})
					.catch(error => {
						const err = { ...error };

						if (err.response.data.error.code === "user_not_found") {
							this.$store.dispatch("alerts/add", {
								title: "Huh! User not found",
								description: "Account doesn't exist, check your email again.",
								type: "error",
								timeout: 8000
							});
						}

						if (err.response.data.error.code === "invalid_password") {
							this.$store.dispatch("alerts/add", {
								title: "Whow! Password",
								description: "Enter the correct password and try again.",
								type: "warning",
								timeout: 6000
							});
						}
					});
			} else {
				if (!this.emailAddress.value) {
					this.emailAddress.error.show = true;
				}
				if (!this.password.value) {
					this.password.error.show = true;
				}
			}
		}
	}
};
</script>
