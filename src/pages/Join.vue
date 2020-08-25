<template>
	<div class="auth">
		<div class="authform">
			<div class="authform__wrapper">
				<router-link to="/" class="authform__logo">
					<img src="@/assets/images/logo.svg" />
				</router-link>
				<div class="authform__header">
					<h3>Create your account</h3>
				</div>
				<l-text
					v-model="emailAddress.value"
					label="Email Address"
					type="email"
					name="email"
					placeholder="Email address"
					:error="emailAddress.error"
					@keydown.native="emailAddressHandler"
				/>
				<l-text
					v-model="password.value"
					label="Password"
					type="password"
					name="password"
					placeholder="Password"
					:error="password.error"
					@keydown.native="passwordHandler"
				/>
				<Button @click.native="join" type="primary">
					Create account
				</Button>
			</div>
			<div class="authform__other">
				Already have an account?
				<router-link to="/login">Log in here</router-link>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

// component
import LText from "../components/ui/input/LText";
import Button from "../components/ui/Button";

export default {
	name: "Join",
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
								description: "Congrats on creating your account.",
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
							this.$router.push("/");
						}
					})
					.catch(error => {
						const err = { ...error };

						if (err.response.data.error.code === "email_already_taken") {
							this.$store.dispatch("alerts/add", {
								title: "Bummer! Email exists",
								description: "Try again with another email address.",
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
