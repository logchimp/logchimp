<template>
	<div>
		<div class="auth-form-header">
			<site-branding :settings="settings" />
			<h3 class="auth-form-heading">Create your account</h3>
		</div>
		<server-error v-if="serverError" @close="serverError = false" />
		<div class="card">
			<l-text
				v-model="email.value"
				label="Email Address"
				type="email"
				name="email"
				placeholder="Email address"
				:error="email.error"
				@keyup-enter="join"
				@hide-error="hideEmailError"
			/>
			<l-text
				v-model="password.value"
				label="Password"
				type="password"
				name="password"
				placeholder="Password"
				:error="password.error"
				@keyup-enter="join"
				@hide-error="hidePasswordError"
			/>
			<div style="display: flex; justify-content: center">
				<Button
					type="primary"
					:loading="buttonLoading"
					:disabled="!settings.allowSignup"
					@click="join"
				>
					Create account
				</Button>
			</div>
		</div>
		<div class="auth-form-other">
			Already have an account?
			<a href="/login">Log in</a>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// component
import ServerError from "../components/serverError.vue";
import LText from "../components/ui/LText.vue";
import Button from "../components/ui/Button.vue";
import SiteBranding from "../components/site/SiteBranding.vue";

export default {
	name: "Join",
	layout: "auth",
	components: {
		// components
		ServerError,
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
			buttonLoading: false,
			serverError: false
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
		async join() {
			if (!(this.email.value && this.password.value)) {
				if (!this.email.value) {
					this.email.error.show = true;
					this.email.error.message = "Required";
				}

				if (!this.password.value) {
					this.password.error.show = true;
					this.password.error.message = "Required";
				}

				return;
			}

			this.buttonLoading = true;

			try {
				const { user } = await this.$axios.$post("/api/v1/auth/signup", {
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
				if (error.response.data.code === "MAIL_CONFIG_MISSING") {
					this.serverError = true;
				}

				if (error.response.data.code === "USER_EXISTS") {
					this.email.error.show = true;
					this.email.error.message = "Exists";
				}

				this.buttonLoading = false;
			}
		}
	},
	head() {
		return {
			title: `Join • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Join • ${this.settings.title}`
				}
			]
		};
	}
};
</script>
