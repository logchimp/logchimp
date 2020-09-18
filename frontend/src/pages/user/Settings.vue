<template>
	<Form>
		<h4 class="user-settings-heading">Account settings</h4>
		<div v-if="!user.loading">
			<div class="user-settings-name">
				<l-text
					v-model="user.firstname.value"
					label="First name"
					type="text"
					name="First name"
					placeholder="First name"
					class="user-settings-name-item"
					@keyup.native.enter="updateSettings"
				/>
				<l-text
					v-model="user.lastname.value"
					label="Last name"
					type="text"
					name="Last name"
					placeholder="Last name"
					class="user-settings-name-item"
					@keyup.native.enter="updateSettings"
				/>
			</div>
			<l-text
				v-model="user.username.value"
				label="Username"
				type="text"
				name="Username"
				placeholder="Username"
				:disabled="true"
			/>
			<l-text
				v-model="user.emailAddress.value"
				label="Email Address"
				type="text"
				name="Email Address"
				placeholder="Email address"
				:disabled="true"
			/>
			<div style="display: flex; justify-content: flex-start;">
				<Button type="primary" @click="updateSettings" :loading="buttonLoading">
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
// packages
import axios from "axios";

// components
import Loader from "../../components/Loader";
import Form from "../../components/Form";
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
	name: "UserSettings",
	data() {
		return {
			user: {
				loading: false,
				firstname: {
					value: ""
				},
				lastname: {
					value: ""
				},
				username: {
					value: ""
				},
				emailAddress: {
					value: ""
				}
			},
			buttonLoading: false
		};
	},
	components: {
		// components
		Loader,
		Form,
		LText,
		Button
	},
	methods: {
		getUser() {
			const userId = this.$store.getters["user/getUserId"];

			if (userId) {
				this.user.loading = true;
				axios({
					method: "get",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/users/${userId}`
				})
					.then(response => {
						this.user.firstname.value = response.data.user.firstname || "";
						this.user.lastname.value = response.data.user.lastname || "";
						this.user.username.value = response.data.user.username || "";
						this.user.emailAddress.value = response.data.user.emailAddress;
						this.user.loading = false;
					})
					.catch(error => {
						this.user.loading = false;
						console.error(error);
					});
			} else {
				this.$store.dispatch("alerts/add", {
					title: "Unauthorized",
					description: "You need to login to access 'User settings' page.",
					type: "error",
					timeout: 6000
				});
				this.$router.push("/login");
			}
		},
		updateSettings() {
			this.buttonLoading = true;
			const userId = this.$store.getters["user/getUserId"];

			axios({
				method: "patch",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/user`,
				data: {
					userId,
					firstname: this.user.firstname.value,
					lastname: this.user.lastname.value
				}
			})
				.then(response => {
					this.user.firstname.value = response.data.user.firstname || "";
					this.user.lastname.value = response.data.user.lastname || "";
					this.buttonLoading = false;
				})
				.catch(error => {
					this.buttonLoading = false;
					console.error(error);
				});
		}
	},
	created() {
		this.getUser();
	}
};
</script>
