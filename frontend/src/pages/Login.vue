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
					@keyup.native.enter="login"
				/>
				<l-text
					v-model="password.value"
					label="Password"
					type="password"
					name="password"
					placeholder="Password"
					:error="password.error"
					@keyup.native.enter="login"
				/>
				<div style="display: flex; justify-content: center;">
					<Button @click="login" type="primary" :loading="buttonLoading">
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
					message: ""
				}
			},
			password: {
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
	methods: {
		login() {
			if (this.emailAddress.value && this.password.value) {
				this.buttonLoading = true;

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

							this.buttonLoading = false;

							if (this.$route.query.redirect) {
								this.$router.push(this.$route.query.redirect);
							} else {
								this.$router.push("/");
							}
						}
					})
					.catch(error => {
						if (error.response.data.code === "USER_NOT_FOUND") {
							this.emailAddress.error.show = true;
							this.emailAddress.error.message = "User not found";
						}

						if (error.response.data.code === "INCORRECT_PASSWORD") {
							this.password.error.show = true;
							this.password.error.message = "Incorrect password";
						}

						this.buttonLoading = false;
					});
			} else {
				if (!this.emailAddress.value) {
					this.emailAddress.error.show = true;
					this.emailAddress.error.message = "Required";
				}
				if (!this.password.value) {
					this.password.error.show = true;
					this.password.error.message = "Required";
				}
			}
		}
	}
};
</script>
