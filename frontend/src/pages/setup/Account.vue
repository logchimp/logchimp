<template>
	<container>
		<div class="onboarding-content">
			<div class="onboarding-header">
				<h2 class="onboarding-heading">Create an account</h2>
			</div>
			<Form class="onboarding-form account-form-container">
				<l-text
					v-model="fullName.value"
					label="Full name"
					type="text"
					name="Full name"
					placeholder="Mike M. Smit"
					:error="fullName.error"
					@keyup-enter="createAccount"
					@hide-error="hideFullNameError"
				/>
				<l-text
					v-model="emailAddress.value"
					label="Email address"
					type="text"
					name="Email address"
					placeholder="Eg. email@example.com"
					:error="emailAddress.error"
					@keyup-enter="createAccount"
					@hide-error="hideEmailAddressError"
				/>
				<l-text
					v-model="password.value"
					label="Password"
					type="password"
					name="Password"
					placeholder="At least 10 character"
					:error="password.error"
					@keyup-enter="createAccount"
					@hide-error="hidePasswordError"
				/>
				<div style="display: flex; justify-content: center;">
					<Button
						:loading="buttonLoading"
						@click="createAccount"
						type="primary"
					>
						Create account
					</Button>
				</div>
			</Form>
			<p class="account-tos">
				By continuing, you agree to LogChimp's <span>Terms</span> and
				<span>Privacy</span> policy.
			</p>
		</div>
	</container>
</template>

<script>
// modules
import { signup } from "../../modules/auth";

// components
import Container from "../../components/Container";
import Form from "../../components/Form";
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
	name: "SetupAccount",
	data() {
		return {
			fullName: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
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
		Container,
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
		hideFullNameError(event) {
			this.fullName.error = event;
		},
		hideEmailAddressError(event) {
			this.emailAddress.error = event;
		},
		hidePasswordError(event) {
			this.password.error = event;
		},
		async createAccount() {
			if (this.buttonLoading) {
				return;
			}

			if (
				!(this.fullName.value && this.emailAddress.value && this.password.value)
			) {
				if (!this.fullName.value) {
					this.fullName.error.show = true;
					this.fullName.error.message = "Required";
				}
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
				const response = await signup(
					this.emailAddress.value,
					this.password.value,
					this.fullName.value,
					true
				);

				this.$store.dispatch("user/login", {
					...response.data.user
				});

				this.$router.push("/setup/create-board");
			} catch (error) {
				console.error(error);
			} finally {
				this.buttonLoading = false;
			}
		}
	},
	metaInfo() {
		return {
			title: "Account · Onboarding",
			meta: [
				{
					name: "og:title",
					content: `Account · Onboarding · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
