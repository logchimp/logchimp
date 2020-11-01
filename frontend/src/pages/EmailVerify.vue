<template>
	<div class="container">
		<div v-if="!loading" class="email-verification">
			<div class="auth-form-header">
				<router-link to="/" class="auth-form-logo site-info">
					<img
						class="site-logo"
						:src="getSiteSittings.logo"
						:alt="getSiteSittings.title"
					/>
					<h5 class="site-name">{{ getSiteSittings.title }}</h5>
				</router-link>
			</div>
			<Form v-if="success" class="auth-form">
				<success-icon fill="#64B285" stroke="white" />
				<div>
					Thank you verifying your account. You may close this window.
				</div>
			</Form>
			<Form v-else class="auth-form">
				<error-icon fill="#DE544E" stroke="white" />
				<div>
					Invalid or expired activation link.
				</div>
			</Form>
		</div>
		<div v-else class="email-verification">
			<div class="loader-container">
				<loader />
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { verifyUserEmailAddress } from "../modules/auth";

// components
import Loader from "../components/Loader";
import Form from "../components/Form";

// icons
import SuccessIcon from "../components/icons/Success";
import ErrorIcon from "../components/icons/Error";

export default {
	name: "EmailVerification",
	data() {
		return {
			loading: false,
			success: false
		};
	},
	components: {
		// components
		Loader,
		Form,

		// icons
		SuccessIcon,
		ErrorIcon
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		async verifyEmail() {
			const token = this.$route.query.token;

			if (!token) {
				this.success = false;
				return;
			}

			this.loading = true;

			try {
				await verifyUserEmailAddress(token);

				this.success = true;
				this.loading = false;

				this.$store.dispatch("user/logout");
			} catch (error) {
				this.loading = false;

				if (error.response.data.code === "USER_ALREADY_VERIFIED") {
					this.$router.push("/");
					return;
				}

				this.success = false;
			}
		}
	},
	created() {
		this.verifyEmail();
	},
	metaInfo() {
		return {
			title: "Email verification"
		};
	}
};
</script>
