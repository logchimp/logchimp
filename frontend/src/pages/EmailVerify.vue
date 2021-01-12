<template>
	<div class="auth-form">
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
		<div v-if="success" class="card">
			<success-icon fill="#64B285" stroke="white" />
			<div>
				Thank you verifying your account. You may close this window.
			</div>
		</div>
		<div v-if="error" class="card">
			<error-icon fill="#DE544E" stroke="white" />
			<div>
				Invalid or expired activation link.
			</div>
		</div>
		<div v-if="loading" class="email-verification">
			<div class="loader-container">
				<loader />
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { verifyUserEmail } from "../modules/auth";

// components
import Loader from "../components/Loader";

// icons
import SuccessIcon from "../components/icons/Success";
import ErrorIcon from "../components/icons/Error";

export default {
	name: "EmailVerification",
	data() {
		return {
			loading: true,
			success: false,
			error: false
		};
	},
	components: {
		// components
		Loader,

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
				this.loading = false;
				this.error = true;
				return;
			}

			try {
				const response = await verifyUserEmail(token);
				if (response.data.verify.success) this.success = true;
			} catch (error) {
				if (error.response.data.code === "USER_ALREADY_VERIFIED") {
					return this.$router.push("/");
				}

				this.error = true;
			} finally {
				this.loading = false;
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
