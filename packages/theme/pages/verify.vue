<template>
	<div class="auth-form">
		<div class="auth-form-header">
			<site-branding :settings="settings" />
		</div>
		<div v-if="success" class="card">
			<success-icon color="#64B285" />
			<div>Thank you verifying your account. You may close this window.</div>
		</div>
		<div v-if="error" class="card">
			<error-icon color="#DE544E" />
			<div>Invalid or expired activation link.</div>
		</div>
		<div v-if="loading" class="email-verification">
			<div class="loader-container">
				<loader />
			</div>
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import { CheckCircle as SuccessIcon, XCircle as ErrorIcon } from "lucide-vue";

// components
import Loader from "../components/ui/Loader.vue";
import SiteBranding from "../components/site/SiteBranding.vue";

export default {
	name: "EmailVerification",
	components: {
		// components
		Loader,
		SiteBranding,

		// icons
		SuccessIcon,
		ErrorIcon
	},
	data() {
		return {
			loading: true,
			success: false,
			error: false
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	created() {
		this.verifyEmail();
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
				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/auth/email/validate",
					data: {
						token
					}
				});

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
	metaInfo() {
		return {
			title: `Email verification • ${this.settings.title}`
		};
	}
};
</script>
