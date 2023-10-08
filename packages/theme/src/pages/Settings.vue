<template>
  <div>
    <h4 class="form-header">
      Account settings
    </h4>
    <div v-if="!loading">
      <server-error v-if="serverError" @close="serverError = false" />

      <alert
        v-if="!isVerified"
        title="Email verification"
        description="We’ve sent you an verification email. Please follow the instructions in the email."
        type="warning"
        :class="$style.verification"
      >
        <template #cta>
          <Button
            type="primary"
            :loading="resendVerificationEmailButtonLoading"
            @click="resendEmail"
          >
            Resend
          </Button>
        </template>
      </alert>

      <l-text
        v-model="name.value"
        label="Name"
        type="text"
        name="Name"
        placeholder="Full name"
        class="user-settings-name-item"
        @keyup-enter="updateSettings"
        @hide-error="hideNameError"
        :error="name.error"
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

// modules
import { router } from "../router";
import { getUserSettings, updateUserSettings } from "../modules/users";
import { resendUserVerificationEmail } from "../modules/auth";
import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"
import tokenError from "../utils/tokenError";

// components
import { Alert } from "../components/ui/Alert";
import Loader from "../components/ui/Loader.vue";
import ServerError from "../components/serverError.vue";
import LText from "../components/ui/input/LText.vue";
import Button from "../components/ui/Button.vue";
import { FormFieldErrorType } from "../components/ui/input/formBaseProps";

const { get: siteSettings } = useSettingStore()
const { getUserId } = useUserStore()

const user = reactive({
	username: "",
	email: "",
});

const name = reactive({
  value: "",
  error: {
    show: false,
    message: ""
  }
})

const loading = ref<boolean>(false);
const isVerified = ref<boolean>(false);
const serverError = ref<boolean>(false);
const resendVerificationEmailButtonLoading = ref<boolean>(false);
const updateUserButtonLoading = ref<boolean>(false)

async function getUser() {
	loading.value = true;

	try {
		const response = await getUserSettings();

		name.value = response.data.user.name;
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
			name: name.value,
		});

		name.value = response.data.user.name;
		updateUserButtonLoading.value = false;
    // TODO: Add TS types
    // biome-ignore lint: Add TS types
	} catch (error: any) {
		updateUserButtonLoading.value = false;

    Object.assign(name.error, {
      message: error.response.data.name,
      show: true,
    })
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

function hideNameError(value: FormFieldErrorType) {
  Object.assign(name.error, value)
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
			content: () => `User settings • ${siteSettings.title}`
		}
	]
})
</script>

<style lang='scss' module>
.verification {
	margin-bottom: 2rem;
}
</style>
