<template>
	<div class="auth">
		<div class="authform">
			<div class="authform__wrapper">
				<router-link to="/" class="authform__logo">
					<img src="@/assets/images/logo.svg" />
				</router-link>
				<div class="authform__header">
					<h3>Welcome back!</h3>
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
				<Button @click.native="login" type="primary">
					Login
				</Button>
			</div>
			<div class="authform__other">
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
import LText from "../components/ui/input/LText";
import Button from "../components/ui/Button";

export default {
	name: "Login",
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
		login() {
			axios
				.post(`${process.env.VUE_APP_SEVER_URL}/api/v1/auth/login`, {
					email: this.email,
					password: this.password
				})
				.then(response => {
					if (response.status === 200) {
						this.$store.dispatch("member/login", {
							authToken: response.data.token,
							memberId: response.data.member.member_id,
							firstName: response.data.member.first_name,
							lastName: response.data.member.last_name,
							emailAddress: response.data.member.email_address,
							profilePicture: response.data.member.profile_picture,
							isVerified: response.data.member.is_verified,
							isBlocked: response.data.member.is_blocked,
							isModerator: response.data.member.is_moderator,
							isOwner: response.data.member.is_owner,
							createdAt: response.data.member.created_at,
							updatedAt: response.data.member.updated_at
						});
						this.$router.push("/");
					}
				})
				.catch(error => {
					console.log(error);
				});
		}
	}
};
</script>
