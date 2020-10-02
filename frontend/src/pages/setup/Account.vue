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
// packages
import axios from "axios";

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
		createAccount() {
			if (
				this.fullName.value &&
				this.emailAddress.value &&
				this.password.value
			) {
				if (!this.buttonLoading) {
					this.buttonLoading = true;
					axios
						.post(`${process.env.VUE_APP_SEVER_URL}/api/v1/auth/signup`, {
							fullName: this.fullName.value,
							emailAddress: this.emailAddress.value,
							password: this.password.value,
							isOwner: true
						})
						.then(response => {
							if (response.status === 201) {
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
								this.$router.push("/setup/create-board");
								this.buttonLoading = false;
							}
						})
						.catch(error => {
							this.buttonLoading = false;
							console.error(error);
						});
				}
			} else {
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
		}
	}
};
</script>
