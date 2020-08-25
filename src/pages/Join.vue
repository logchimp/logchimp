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
					v-model="emailAddress"
					type="email"
					name="email"
					placeholder="Email address"
				/>
				<l-text
					v-model="password"
					type="password"
					name="password"
					placeholder="Password"
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
			emailAddress: "",
			password: ""
		};
	},
	components: {
		LText,
		Button
	},
	methods: {
		join() {
			axios
				.post(`${process.env.VUE_APP_SEVER_URL}/api/v1/auth/signup`, {
					emailAddress: this.emailAddress,
					password: this.password
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
		}
	}
};
</script>
