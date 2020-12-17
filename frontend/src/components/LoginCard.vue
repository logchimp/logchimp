<template>
	<Form>
		<div class="site-setup-card-header">
			<h4 class="site-setup-card-header-heading">Login</h4>
			<p class="site-setup-card-header-label">
				Log in to your account to give feedback
			</p>
		</div>
		<div class="site-setup-card-button">
			<Button type="primary" @click="loginRedirect">
				Login
			</Button>
		</div>
	</Form>
</template>

<script>
// components
import Form from "./Form";
import Button from "./Button";

export default {
	name: "LoginCard",
	components: {
		Form,
		Button
	},
	methods: {
		loginRedirect() {
			this.$router.push({
				path: "/login",
				query: {
					redirect: this.$route.fullPath
				}
			});
		}
	}
};
</script>
