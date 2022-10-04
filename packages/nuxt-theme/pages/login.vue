<template>
	<div>
		<div class="auth-form-header">
			<site-branding :settings="settings" />
			<h3 class="auth-form-heading">Welcome back!</h3>
		</div>
		<div class="card">
			<l-text
				v-model="email.value"
				label="Email Address"
				type="email"
				name="email"
				placeholder="Email address"
				:error="email.error"
				@keyup-enter="login"
				@hide-error="hideEmailError"
			/>
			<l-text
				v-model="password.value"
				label="Password"
				type="password"
				name="password"
				placeholder="Password"
				:error="password.error"
				@keyup-enter="login"
				@hide-error="hidePasswordError"
			/>
			<div style="display: flex; justify-content: center">
				<Button type="primary" :loading="buttonLoading" @click="login">
					Login
				</Button>
			</div>
		</div>
		<div class="auth-form-other">
			<a href="/password-reset">Forget password?</a>
			<template v-if="settings.allowSignup">
				• Don't have an account yet?
				<a href="/join">Sign up</a>
			</template>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// component
import LText from "../components/ui/LText.vue";
import Button from "../components/ui/Button.vue";
import SiteBranding from "../components/site/SiteBranding.vue";

export default {
	name: "Login",
	layout: "auth",
	components: {
		// component
		LText,
		Button,
		SiteBranding
	},
	data() {
		return {
			email: {
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
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	created() {
		const user = !process.server
			? JSON.parse(localStorage.getItem("user"))
			: null;

		if (user) {
			this.$router.push("/");
		}
	},
	methods: {
		hideEmailError(event) {
			this.email.error = event;
		},
		hidePasswordError(event) {
			this.password.error = event;
		},
		async login() {
			if (!(this.email.value && this.password.value)) {
				if (!this.email.value) {
					this.email.error.show = true;
					this.email.error.message = "Required";
				}
				if (!this.password.value) {
					this.password.error.show = true;
					this.password.error.message = "Required";
				}
			}

			this.buttonLoading = true;

			try {
				const { user } = await this.$axios.$post("/api/v1/auth/login", {
					email: this.email.value,
					password: this.password.value
				});

				this.$store.dispatch("user/login", {
					...user
				});

				// redirect to "?redirect" query path if exists
				if (this.$route.query.redirect) {
					this.$router.push(this.$route.query.redirect);
				} else {
					this.$router.push("/");
				}

				this.buttonLoading = false;
			} catch (error) {
				if (error.response.data.code === "USER_NOT_FOUND") {
					this.email.error.show = true;
					this.email.error.message = "User not found";
				}

				if (error.response.data.code === "INCORRECT_PASSWORD") {
					this.password.error.show = true;
					this.password.error.message = "Incorrect password";
				}

				this.buttonLoading = false;
			}
		}
	},
	head() {
		return {
			title: `Login • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Login • ${this.settings.title}`
				}
			]
		};
	}
};
</script>
