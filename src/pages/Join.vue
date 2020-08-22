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
					v-model="email"
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
			email: "",
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
					email: this.email,
					password: this.password
				})
				.then(response => {
					if (response.status === 200) {
						/**
						 * todo: show snackbar notification
						 * check your inbox for email verification.
						 */
					}
				})
				.catch(error => {
					console.log(error);
					// todo: email exist re-direct to login page
					// todo: invalid email show error message
				});
		}
	}
};
</script>
