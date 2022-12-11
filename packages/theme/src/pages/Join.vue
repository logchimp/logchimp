<template>
  <auth-form>
    <div class="auth-form-header">
      <site-branding :title="siteSettings.title" :logo="siteSettings.logo" />
      <h3 class="auth-form-heading">
        Create your account
      </h3>
    </div>
    <server-error v-if="serverError" @close="serverError = false" />
    <div class="card">
      <l-text
        v-model="email"
        label="Email Address"
        type="email"
        name="email"
        placeholder="Email address"
        :error="emailError"
        @keyup-enter="join"
        @hide-error="hideEmailError"
      />
      <l-text
        v-model="password"
        label="Password"
        type="password"
        name="password"
        placeholder="Password"
        :error="passwordError"
        @keyup-enter="join"
        @hide-error="hidePasswordError"
      />
      <div style="display: flex; justify-content: center">
        <Button
          type="primary"
          :loading="buttonLoading"
          :disabled="!siteSettings.allowSignup"
          @click="join"
        >
          Create account
        </Button>
      </div>
    </div>
    <div class="auth-form-other">
      Already have an account?
      <router-link to="/login">
        Log in
      </router-link>
    </div>
  </auth-form>
</template>

<script lang="ts">
export default {
	name: "Join"
}
</script>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../router";
import { signup } from "../modules/auth";
import { getPermissions } from "../modules/users";
import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"

// component
import AuthForm from "../layout/AuthForm.vue";
import { FormFieldErrorType } from "../components/ui/input/formBaseProps";
import ServerError from "../components/serverError.vue";
import LText from "../components/ui/input/LText.vue";
import Button from "../components/ui/Button.vue";
import SiteBranding from "../components/site/SiteBranding.vue";

const { get: siteSettings } = useSettingStore()
const { getUserId, login, setPermissions } = useUserStore()

const email = ref("");
const emailError = reactive({
	show: false,
	message: ""
})
const password = ref("");
const passwordError = reactive({
	show: false,
	message: ""
})
const buttonLoading = ref(false)
const serverError = ref(false)

function hideEmailError(event: FormFieldErrorType) {
	emailError.message = event.message;
	emailError.show = event.show;
}

function hidePasswordError(event: FormFieldErrorType) {
	passwordError.message = event.message;
	passwordError.show = event.show;
}

async function join() {
	if (!(email.value && password.value)) {
		if (!email.value) {
			emailError.show = true;
			emailError.message = "Required";
		}

		if (!password.value) {
			passwordError.show = true;
			passwordError.message = "Required";
		}

		return;
	}

	buttonLoading.value = true;

	try {
		const response = await signup({
      email: email.value,
      password: password.value
    });

		login(response.data.user);
		const permissions = await getPermissions();
		setPermissions(permissions.data.permissions);

		const route = router.currentRoute.value;
		if (route.query.redirect) {
			router.push(route.query.redirect.toString());
		} else {
			router.push("/");
		}
	} catch (error: any) {
		if (error.response.data.code === "MAIL_CONFIG_MISSING") {
			serverError.value = true;
		}

		if (error.response.data.code === "USER_EXISTS") {
			emailError.show = true;
			emailError.message = "Exists";
		}
	} finally {
		buttonLoading.value = false;
	}
}

onMounted(() => {
  /**
   * Redirect the user to homepage or "redirect" query param
   * If the user is already authenticated.
   */
  if (getUserId) {
    const route = router.currentRoute.value
    if (route.query.redirect) {
			router.push(route.query?.redirect.toString());
		} else {
			router.push("/");
		}
  }
})

useHead({
	title: "Join",
	meta: [
		{
			name: "og:title",
			content: () => `Join • ${siteSettings.title}`
		}
	]
})
</script>
