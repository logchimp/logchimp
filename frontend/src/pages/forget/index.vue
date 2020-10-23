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
				<h3 class="auth-form-heading">Forget password</h3>
			</div>
			<Form class="auth-form">
				<l-text
					v-model="emailAddress.value"
					label="Email Address"
					type="email"
					name="email"
					placeholder="Email address"
					:error="emailAddress.error"
					@keyup-enter="forgetPassword"
					@hide-error="hideEmailAddressError"
				/>
				<div style="display: flex; justify-content: center;">
					<Button
						@click="forgetPassword"
						type="primary"
						:loading="buttonLoading"
					>
						Continue
					</Button>
				</div>
			</Form>
			<div class="auth-form-other">
				Don't have an account yet?
				<router-link to="/join">Sign up</router-link>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

// component
import Form from "../../components/Form";
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
	name: "ForgetPassword",
	data() {
		return {
			emailAddress: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			requestPassword: false,
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
		forgetPassword() {
			if (this.buttonLoading) {
				return;
			}
			if (this.emailAddress.value) {
				this.buttonLoading = true;

				axios
					.post("/api/v1/auth/password/reset", {
						emailAddress: this.emailAddress.value
					})
					.then(() => {
						this.$store.dispatch("alerts/add", {
							title: "Check your email for instructions",
							type: "success",
							timeout: 8000
						});
						this.emailAddress.value = "";

						this.buttonLoading = false;
					})
					.catch(error => {
						if (error.response.data.code === "USER_NOT_FOUND") {
							this.emailAddress.error.show = true;
							this.emailAddress.error.message = "User not found";
						}

						this.buttonLoading = false;
					});
			} else {
				if (!this.emailAddress.value) {
					this.emailAddress.error.show = true;
					this.emailAddress.error.message = "Required";
				}
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
			title: "Password reset",
			meta: [
				{
					name: "og:title",
					content: `Password reset · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
