<template>
	<div class="auth">
		<div class="auth-form-container">
			<div class="auth-form-header">
				<router-link to="/" class="auth-form-logo site-info">
					<img
						class="site-logo"
						:src="getSiteSittings.logo"
						:alt="getSiteSittings.title"
					/>
					<h5 class="site-name">{{ getSiteSittings.title }}</h5>
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
					@keyup-enter="login"
					@hide-error="hideEmailAddressError"
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
				<div style="display: flex; justify-content: center;">
					<Button @click="login" type="primary" :loading="buttonLoading">
						Login
					</Button>
				</div>
			</Form>
			<div class="auth-form-other">
				<router-link to="/forget">Forget password?</router-link>
				· Don't have an account yet?
				<router-link to="/join">Sign up</router-link>
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { signin } from "../modules/auth";

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
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		hideEmailAddressError(event) {
			this.emailAddress.error = event;
		},
		hidePasswordError(event) {
			this.password.error = event;
		},
		async login() {
			if (this.buttonLoading) {
				return;
			}

			if (!(this.emailAddress.value && this.password.value)) {
				if (!this.emailAddress.value) {
					this.emailAddress.error.show = true;
					this.emailAddress.error.message = "Required";
				}
				if (!this.password.value) {
					this.password.error.show = true;
					this.password.error.message = "Required";
				}
			}

			this.buttonLoading = true;

			try {
				const response = await signin(
					this.emailAddress.value,
					this.password.value
				);
				this.$store.dispatch("user/login", {
					...response.data.user
				});

				this.buttonLoading = false;

				if (this.$route.query.redirect) {
					this.$router.push(this.$route.query.redirect);
				} else {
					this.$router.push("/");
				}
			} catch (error) {
				if (error.response.data.code === "USER_NOT_FOUND") {
					this.emailAddress.error.show = true;
					this.emailAddress.error.message = "User not found";
				}

				if (error.response.data.code === "INCORRECT_PASSWORD") {
					this.password.error.show = true;
					this.password.error.message = "Incorrect password";
				}

				this.buttonLoading = false;
			}
		}
	},
	created() {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			this.$router.push("/");
		}
	},
	metaInfo() {
		return {
			title: "Login",
			meta: [
				{
					name: "og:title",
					content: `Login · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
