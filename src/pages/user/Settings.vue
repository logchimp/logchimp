<template>
	<div>
		<div class="usersettings__name">
			<l-text
				v-model="firstname"
				type="text"
				name="First name"
				placeholder="First name"
				class="usersettings__name-item"
			/>
			<l-text
				v-model="lastname"
				type="text"
				name="Last name"
				placeholder="Last name"
				class="usersettings__name-item"
			/>
		</div>
		<l-text
			v-model="username"
			type="text"
			name="Username"
			placeholder="Username"
			:disabled="true"
		/>
		<l-text
			v-model="emailAddress"
			type="text"
			name="Email Address"
			placeholder="Email address"
			:disabled="true"
		/>
		<Button type="primary" @click.native="updateSettings">
			Update
		</Button>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import LText from "../../components/ui/input/LText";
import Button from "../../components/ui/Button";

export default {
	name: "UserSettings",
	data() {
		return {
			firstname: "",
			lastname: "",
			username: "",
			emailAddress: ""
		};
	},
	components: {
		LText,
		Button
	},
	methods: {
		user() {
			const userId = this.$store.getters["user/getUserId"];

			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/users/${userId}`
			})
				.then(response => {
					this.firstname = response.data.user.firstname || "";
					this.lastname = response.data.user.lastname || "";
					this.username = response.data.user.username || "";
					this.emailAddress = response.data.user.emailAddress;
				})
				.catch(error => {
					console.log(error);
				});
		},
		updateSettings() {
			const userId = this.$store.getters["user/getUserId"];

			axios({
				method: "patch",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/user`,
				data: {
					userId,
					firstname: this.firstname,
					lastname: this.lastname
				}
			})
				.then(response => {
					this.firstname = response.data.user.firstname || "";
					this.lastname = response.data.user.lastname || "";
				})
				.catch(error => {
					console.log(error);
				});
		}
	},
	created() {
		this.user();
	}
};
</script>
