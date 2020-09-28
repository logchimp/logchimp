<template>
	<div class="auth">
		<div class="auth-form-container">
			<div class="auth-form-header">
				<router-link to="/" class="auth-form-logo">
					<img src="@/assets/images/logo.svg" />
				</router-link>
				<h3 class="auth-form-heading">Create your account</h3>
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
					@keyup.native.enter="join"
				/>
				<l-text
					v-model="password.value"
					label="Password"
					type="password"
					name="password"
					placeholder="Password"
					:error="password.error"
					@keydown.native="passwordHandler"
					@keyup.native.enter="join"
				/>
				<div style="display: flex; justify-content: center;">
					<Button @click="join" type="primary" :loading="buttonLoading">
						Create account
					</Button>
				</div>
			</Form>
			<div class="auth-form-other">
				Already have an account?
				<router-link to="/login">Log in</router-link>
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
	name: "Join",
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
		join() {
			if (this.emailAddress.value && this.password.value) {
				this.buttonLoading = true;

				axios
					.post(`${process.env.VUE_APP_SEVER_URL}/api/v1/auth/signup`, {
						emailAddress: this.emailAddress.value,
						password: this.password.value
					})
					.then(response => {
						if (response.status === 201) {
							/**
							 * todo: show snackbar notification
							 * check your inbox for email verification.
							 */
							this.$store.dispatch("alerts/add", {
								title: "Yay! Welcome onboard!",
								type: "success",
								timeout: 10000
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
						this.buttonLoading = false;
						const err = { ...error };

						if (err.response.data.error.code === "email_already_taken") {
							this.$store.dispatch("alerts/add", {
								title: "Bummer! Email exists",
								type: "error",
								timeout: 4000
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
