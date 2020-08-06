<template>
	<div class="auth">
		<l-modal size="small">
			<template v-slot:header>
				{{ authType === "signup" ? "Sign up for" : "Login to" }} LogChimp
			</template>
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
			<l-primary-button @click.native="memberAuth">
				{{ authType === "signup" ? "Sign up" : "Login" }}
			</l-primary-button>
			<p
				v-if="authType === 'signup'"
				class="auth__type-switch"
				@click="switchAuthType('login')"
			>
				Already have an account? Login
			</p>
			<p
				v-if="authType === 'login'"
				class="auth__type-switch"
				@click="switchAuthType('signup')"
			>
				Need an account? Signup
			</p>
			<template v-slot:footer>
				<p class="auth__footer-tos">
					By continuing, you agree to LogChimp's
					<a href="/">Terms of Service</a>, <a href="/">Privacy Policy</a>.
				</p>
			</template>
		</l-modal>
	</div>
</template>

<script>
// packages
import axios from "axios";

// component
import LModal from "../ui/modal/LModal";
import LText from "../ui/input/LText";
import LPrimaryButton from "../ui/button/LPrimaryButton";

export default {
	name: "AuthModal",
	data() {
		return {
			authType: "signup",
			email: "",
			password: ""
		};
	},
	components: {
		LModal,
		LText,
		LPrimaryButton
	},
	methods: {
		switchAuthType(value) {
			this.authType = value;
		},
		memberAuth() {
			if (this.authType === "signup") {
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
			} else {
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
	}
};
</script>
