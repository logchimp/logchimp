<template>
	<Form>
		<h4 class="user-settings-heading">Account settings</h4>
		<div v-if="!user.loading">
			<div v-if="!userIsVerified" class="user-settings-verification">
				<div class="user-settings-verification-content">
					<alert-icon />
					<div class="user-settings-verification-text">
						<h6>Email verification</h6>
						<p>
							We’ve sent you an verification email. Please follow the
							instructions in the email.
						</p>
					</div>
				</div>

				<Button
					type="background"
					@click="resendEmail"
					:loading="resendVerificationEmailButtonLoading"
				>
					Resend
				</Button>
			</div>
			<l-text
				v-model="user.name.value"
				label="Name"
				type="text"
				name="Name"
				placeholder="Full name"
				class="user-settings-name-item"
				@keyup-enter="updateSettings"
			/>
			<l-text
				v-model="user.username.value"
				label="Username"
				type="text"
				name="Username"
				placeholder="Username"
				:disabled="true"
			/>
			<l-text
				v-model="user.email.value"
				label="Email Address"
				type="text"
				name="Email Address"
				placeholder="Email address"
				:disabled="true"
			/>
			<div style="display: flex; justify-content: flex-start;">
				<Button
					type="primary"
					@click="updateSettings"
					:loading="updateUserButtonLoading"
				>
					Update
				</Button>
			</div>
		</div>
		<div v-else class="loader-container">
			<loader />
		</div>
	</Form>
</template>

<script>
// modules
import { getUserSettings, updateUserSettings } from "../modules/users";
import { resendUserVerificationEmail } from "../modules/auth";

// components
import Loader from "../components/Loader";
import Form from "../components/Form";
import LText from "../components/input/LText";
import Button from "../components/Button";

// mixins
import tokenErrorHandle from "../mixins/tokenErrorHandle";

// icons
import AlertIcon from "../components/icons/Alert";

export default {
	name: "UserSettings",
	data() {
		return {
			user: {
				loading: false,
				name: {
					value: ""
				},
				username: {
					value: ""
				},
				email: {
					value: ""
				},
				isVerified: false
			},
			resendVerificationEmailButtonLoading: false,
			updateUserButtonLoading: false
		};
	},
	mixins: [tokenErrorHandle],
	components: {
		// components
		Loader,
		Form,
		LText,
		Button,

		// icons
		AlertIcon
	},
	computed: {
		userIsVerified() {
			return this.user.isVerified;
		},
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		async getUser() {
			this.user.loading = true;

			try {
				const response = await getUserSettings();

				this.user.name.value = response.data.user.name;
				this.user.username.value = response.data.user.username;
				this.user.email.value = response.data.user.email;
				this.user.isVerified = response.data.user.isVerified;
			} catch (error) {
				this.userNotFound(error);
			} finally {
				this.user.loading = false;
			}
		},
		async updateSettings() {
			this.updateUserButtonLoading = true;

			const userData = {
				name: this.user.name.value
			};

			try {
				const response = await updateUserSettings(userData);
				this.user.name.value = response.data.user.name;
			} catch (error) {
				this.userNotFound(error);
			} finally {
				this.updateUserButtonLoading = false;
			}
		},
		async resendEmail() {
			if (this.resendVerificationEmailButtonLoading) {
				return;
			}
			this.resendVerificationEmailButtonLoading = true;

			try {
				const email = this.user.email.value;
				await resendUserVerificationEmail(email);
			} catch (error) {
				console.error(error);
			} finally {
				this.resendVerificationEmailButtonLoading = false;
			}
		}
	},
	created() {
		const userId = this.$store.getters["user/getUserId"];

		if (userId) {
			this.getUser();
		} else {
			this.$router.push({
				path: "/login",
				query: {
					redirect: "/settings"
				}
			});
		}
	},
	metaInfo() {
		return {
			title: "User settings",
			meta: [
				{
					name: "og:title",
					content: `User settings · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
