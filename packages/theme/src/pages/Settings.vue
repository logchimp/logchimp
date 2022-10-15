<template>
  <div>
    <h4 class="form-header">
      Account settings
    </h4>
    <div v-if="!loading">
      <server-error v-if="serverError" @close="serverError = false" />
      <div v-if="!isVerified" class="user-settings-verification">
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
          :loading="resendVerificationEmailButtonLoading"
          @click="resendEmail"
        >
          Resend
        </Button>
      </div>
      <l-text
        v-model="user.name"
        label="Name"
        type="text"
        name="Name"
        placeholder="Full name"
        class="user-settings-name-item"
        @keyup-enter="updateSettings"
      />
      <l-text
        v-model="user.username"
        label="Username"
        type="text"
        name="Username"
        placeholder="Username"
        :disabled="true"
      />
      <l-text
        v-model="user.email"
        label="Email Address"
        type="text"
        name="Email Address"
        placeholder="Email address"
        :disabled="true"
      />
      <div style="display: flex; justify-content: flex-start">
        <Button
          type="primary"
          :loading="updateUserButtonLoading"
          @click="updateSettings"
        >
          Update
        </Button>
      </div>
    </div>
    <div v-else class="loader-container">
      <loader />
    </div>
  </div>
</template>

<script lang="ts">
export default {
	name: "UserSettings",
}
</script>

<script setup lang="ts">
// packages
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import { AlertTriangle as AlertIcon } from "lucide-vue";

// modules
import { router } from "../router";
import { getUserSettings, updateUserSettings } from "../modules/users";
import { resendUserVerificationEmail } from "../modules/auth";
import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"
import tokenError from "../utils/tokenError";

// components
import Loader from "../components/ui/Loader.vue";
import ServerError from "../components/serverError.vue";
import LText from "../components/ui/input/LText.vue";
import Button from "../components/ui/Button.vue";

const { get: siteSettings } = useSettingStore()
const { getUserId } = useUserStore()

const user = reactive({
	name: "",
	username: "",
	email: "",
});

const loading = ref<boolean>(false);
const isVerified = ref<boolean>(false);
const serverError = ref<boolean>(false);
const resendVerificationEmailButtonLoading = ref<boolean>(false);
const updateUserButtonLoading = ref<boolean>(false)

async function getUser() {
	loading.value = true;

	try {
		const response = await getUserSettings();

		user.name = response.data.user.name;
		user.username = response.data.user.username;
		user.email = response.data.user.email;
		isVerified.value = response.data.user.isVerified;
	} catch (error) {
		tokenError(error);
	} finally {
		loading.value = false;
	}
}

async function updateSettings() {
	updateUserButtonLoading.value = true;

	try {
		const response = await updateUserSettings({
			name: user.name,
		});

		user.name = response.data.user.name;
	} catch (error) {
		tokenError(error);
	} finally {
		updateUserButtonLoading.value = false;
	}
}

async function resendEmail() {
	resendVerificationEmailButtonLoading.value = true;

	try {
		const email = user.email;
		await resendUserVerificationEmail(email);
	} catch (error: any) {
		if (error.response.data.code === "MAIL_CONFIG_MISSING") {
			serverError.value = true;
		}

		console.error(error);
	} finally {
		resendVerificationEmailButtonLoading.value = false;
	}
}

onMounted(() => {
	if (getUserId) {
		getUser();
	} else {
		router.push({
			path: "/login",
			query: {
				redirect: "/settings"
			}
		});
	}
})

useHead({
	title: "User settings",
	meta: [
		{
			name: "og:title",
			content: `User settings • ${siteSettings.title}`
		}
	]
})
</script>

<style lang='sass'>
.user-settings-verification
	border: 1px solid var(--color-gray-90)
	border-radius: var(--border-radius-default)
	padding: 1rem 1.5rem
	margin-bottom: 2rem

	.button
		margin-left: auto

.user-settings-verification, .user-settings-verification-content
	display: flex
	align-items: center

.user-settings-verification-content svg
	margin-right: 1rem
	stroke: var(--color-color-warning)

.user-settings-verification-text
	display: flex
	flex-direction: column

	h6
		margin-bottom: 0.25rem

	p
		font-size: 0.875rem
</style>
