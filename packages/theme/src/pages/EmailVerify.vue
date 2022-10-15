<template>
  <div class="auth-form">
    <div class="auth-form-header">
      <site-branding :title="siteSettings.title" :logo="siteSettings.logo" />
    </div>
    <div v-if="success" class="card">
      <success-icon color="#64B285" />
      <div>
        Thank you verifying your account. You may close this window.
      </div>
    </div>
    <div v-if="error" class="card">
      <error-icon color="#DE544E" />
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

<script lang="ts">
export default {
	name: "EmailVerification"
}
</script>

<script setup lang="ts">
// packages
import { onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";
import { CheckCircle as SuccessIcon, XCircle as ErrorIcon } from "lucide-vue";

// modules
import { router } from "../router";
import { useSettingStore } from "../store/settings"
import { verifyUserEmail } from "../modules/auth";

// components
import Loader from "../components/ui/Loader.vue";
import SiteBranding from "../components/site/SiteBranding.vue";

const { get: siteSettings } = useSettingStore()

const loading = ref(true)
const success = ref(false)
const error = ref(false)

async function verifyEmail() {
	const route = router.currentRoute.value;
	if (!route.query.token) {
    loading.value = false;
		error.value = true;
		return;
	}

	try {
    const token = route.query.token.toString();
		const response = await verifyUserEmail(token);
		if (response.data.verify.success) success.value = true;
	} catch (error: any) {
		if (error.response.data.code === "USER_ALREADY_VERIFIED") {
			return router.push("/");
		}

		error.value = true;
	} finally {
		loading.value = false;
	}
}

onMounted(() => verifyEmail())

useHead({
	title: "Email verification",
	meta: [
		{
			name: "og:title",
			content: `Email verification · ${siteSettings.title}`
		}
	]
})
</script>

<style lang='sass'>
.email-verification
	margin-top: 4rem
	display: flex
	flex-direction: column
	justify-content: center
	align-items: center

.email-verification > .auth-form
	display: flex
	flex-direction: column
	align-items: center

	svg
		margin-bottom: 1rem
		width: 3rem
		height: 3rem
</style>
