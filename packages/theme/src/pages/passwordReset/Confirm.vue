<template>
  <auth-form>
    <div>
      <div class="auth-form-header">
        <site-branding :title="siteSettings.title" :logo="siteSettings.logo" />
        <h3 class="auth-form-heading">Set new password</h3>
      </div>
      <div v-if="validToken.success">
        <div v-if="!changePassword.success" class="card">
          <l-text
            v-model="password.value"
            label="New password"
            type="password"
            name="Password"
            placeholder="Enter new password"
            :error="password.error"
            @keyup-enter="setPassword"
            @hide-error="hidePasswordError"
          />
          <l-text
            v-model="confirmPassword.value"
            label="Confirm password"
            type="password"
            name="Confirm password"
            placeholder="Enter new password again"
            :error="confirmPassword.error"
            @keyup-enter="setPassword"
            @hide-error="hideConfirmPasswordError"
          />
          <div style="display: flex; justify-content: center;">
            <Button
              type="primary"
              :loading="buttonLoading"
              @click="setPassword"
            >
              Reset password
            </Button>
          </div>
        </div>
        <div v-else class="card">
          <success-icon color="#64B285" />
          <div>
            You've successful changed your password. You may close this window.
          </div>
        </div>
      </div>
    </div>
    <div v-if="validToken.error || changePassword.error" class="card">
      <error-icon color="#DE544E" />
      <div>Invalid or expired password reset link.</div>
    </div>
    <div v-if="validToken.loading" class="card">
      <div class="loader-container">
        <loader />
      </div>
    </div>
  </auth-form>
</template>

<script lang="ts">
export default {
  name: "SetNewPassword"
}
</script>

<script setup lang="ts">
// packages
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import { CheckCircle as SuccessIcon, XCircle as ErrorIcon } from "lucide-vue";

// modules
import { validateResetPasswordToken, setNewPassword } from "../../modules/auth";
import { router } from "../../router";
import { useSettingStore } from "../../store/settings";

// component
import AuthForm from "../../layout/AuthForm.vue";
import { FormFieldErrorType } from "../../components/ui/input/formBaseProps";
import Loader from "../../components/ui/Loader.vue";
import LText from "../../components/ui/input/LText.vue";
import Button from "../../components/ui/Button.vue";
import SiteBranding from "../../components/site/SiteBranding.vue";

const { get: siteSettings } = useSettingStore()

const password = reactive({
	value: "",
	error: {
		show: false,
		message: ""
	}
})
const confirmPassword = reactive({
	value: "",
	error: {
		show: false,
		message: ""
	}
})
const validToken = reactive({
	loading: true,
	success: false,
	error: false
})
const changePassword = reactive({
	success: false,
	error: false
})
const buttonLoading = ref(false)

function hidePasswordError(event: FormFieldErrorType) {
	password.error = event;
}

function hideConfirmPasswordError(event: FormFieldErrorType) {
	confirmPassword.error = event;
}

async function validateToken() {
	// have reset password token
	const route = router.currentRoute.value;

	if (!route.query.token) {
    validToken.loading = false;
		validToken.error = true;
		return;
	}

	try {
    const token = route.query.token.toString();
		const response = await validateResetPasswordToken(token);

		if (response.data.reset.valid) {
			validToken.loading = false;
			validToken.success = true;
		}
	} catch (error) {
		validToken.loading = false;
		validToken.error = true;
	}
}

async function setPassword() {
  const route = router.currentRoute.value;
  if (!route.query.token) {
    validToken.error = true;
    return;
  }

	if (!(password.value && confirmPassword.value)) {
		if (!password.value) {
			password.error.show = true;
			password.error.message = "Required";
		}

		if (!confirmPassword.value) {
			confirmPassword.error.show = true;
			confirmPassword.error.message = "Required";
		}
		return;
	}

	// match password and confirm password
	if (password.value !== confirmPassword.value) {
		confirmPassword.error.show = true;
		confirmPassword.error.message = "Password doesn't match";
		return;
	}

	const token = route.query.token.toString();
	buttonLoading.value = true;

	try {
		const response = await setNewPassword({
      token,
      password: password.value
    });

		if (response.data.reset.success) {
			changePassword.success = true;
		}
	} catch (err) {
		changePassword.error = true;
	} finally {
		buttonLoading.value = false;
		// this.$store.dispatch("user/logout");
	}
}

onMounted(() => {
	// validate reset password token
	validateToken();
})

useHead({
	title: "Set new password",
	meta: [
		{
			name: "og:title",
			content: () => `Set new password • ${siteSettings.title}`
		}
	]
})
</script>
