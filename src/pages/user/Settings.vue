<template>
	<div>
		<div class="usersettings__name">
			<l-text
				v-model="firstName"
				type="text"
				name="First name"
				placeholder="First name"
				class="usersettings__name-item"
			/>
			<l-text
				v-model="lastName"
				type="text"
				name="Last name"
				placeholder="Last name"
				class="usersettings__name-item"
			/>
		</div>
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
			firstName: "",
			lastName: "",
			emailAddress: ""
		};
	},
	components: {
		LText,
		Button
	},
	methods: {
		user() {
			const memberId = this.$store.getters["member/getMemberId"];

			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/users/${memberId}`
			})
				.then(response => {
					this.firstName = response.data.user.first_name || "";
					this.lastName = response.data.user.last_name || "";
					this.emailAddress = response.data.user.email_address;
				})
				.catch(error => {
					console.log(error);
				});
		},
		updateSettings() {
			const userId = this.$store.getters["member/getMemberId"];

			axios({
				method: "patch",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/user`,
				data: {
					userId,
					firstName: this.firstName,
					lastName: this.lastName
				}
			})
				.then(response => {
					console.log(response);
					this.firstName = response.data.user.first_name || "";
					this.lastName = response.data.user.last_name || "";
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
