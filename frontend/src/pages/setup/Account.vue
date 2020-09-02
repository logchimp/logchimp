<template>
	<container>
		<div class="onboarding__content">
			<h2 class="onboarding__heading">Create an account</h2>
			<Form
				method="post"
				class="form__container"
				autocomplete
				id="logchimp-create-account-setup"
			>
				<l-text
					v-model="fullName.value"
					label="Full name"
					type="text"
					name="Full name"
					placeholder="Mike M. Smit"
					:error="fullName.error"
					@keydown.native="fullNameHandler"
					@keyup.native.enter="createAccount"
					class="account__form-item"
				/>
				<l-text
					v-model="emailAddress.value"
					label="Email address"
					type="text"
					name="Email address"
					placeholder="Eg. email@example.com"
					:error="emailAddress.error"
					@keydown.native="emailAddressHandler"
					@keyup.native.enter="createAccount"
					class="account__form-item"
				/>
				<l-text
					v-model="password.value"
					label="Password"
					type="password"
					name="Password"
					placeholder="At least 10 character"
					:error="password.error"
					@keydown.native="passwordHandler"
					@keyup.native.enter="createAccount"
					class="account__form-item"
				/>
				<Button
					:loading="buttonLoading"
					@click="createAccount"
					type="primary"
					class="account__form-button"
				>
					Create an account
				</Button>
			</Form>
			<p class="account__tos">
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
import LText from "../../components/ui/input/LText";
import Button from "../../components/ui/Button";

export default {
	name: "SetupAccount",
	data() {
		return {
			fullName: {
				value: "",
				error: {
					show: false,
					message: "Required"
				}
			},
			emailAddress: {
				value: "",
				error: {
					show: false,
					message: "Required"
				}
			},
			password: {
				value: "",
				error: {
					show: false,
					message: "Required"
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
		fullNameHandler() {
			this.fullName.error.show = false;
		},
		emailAddressHandler() {
			this.emailAddress.error.show = false;
		},
		passwordHandler() {
			this.password.error.show = false;
		},
		createAccount() {
			if (
				this.fullName.value &&
				this.emailAddress.value &&
				this.password.value
			) {
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
			} else {
				if (!this.fullName.value) {
					this.fullName.error.show = true;
				}
				if (!this.emailAddress.value) {
					this.emailAddress.error.show = true;
				}
				if (!this.password.value) {
					this.password.error.show = true;
				}
			}
		}
	}
};
</script>

<style lang="sass" scoped>
.account__form-container
	margin-top: 2rem

.account__form-item
	width: 350px

.account__form-button
	margin-top: 2rem

.account__tos
	color: $gray-70
	font-size: 10px
	line-height: 12px
	font-weight: 400
	margin-top: 1.5rem

	span
		font-weight: 500
</style>
