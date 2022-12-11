<template>
  <auth-form>
    <div class="auth-form-header">
      <site-branding :title="siteSettings.title" :logo="siteSettings.logo" />
      <h3 class="auth-form-heading">
        Welcome back!
      </h3>
    </div>
    <div class="card">
      <l-text
        v-model="email"
        label="Email Address"
        type="email"
        name="email"
        placeholder="Email address"
        :error="emailError"
        @keyup-enter="login"
        @hide-error="hideEmailError"
      />
      <l-text
        v-model="password"
        label="Password"
        type="password"
        name="password"
        placeholder="Password"
        :error="passwordError"
        @keyup-enter="login"
        @hide-error="hidePasswordError"
      />
      <div style="display: flex; justify-content: center">
        <Button
          type="primary"
          :loading="buttonLoading"
          @click="login"
        >
          Login
        </Button>
      </div>
    </div>
    <div class="auth-form-other">
      <router-link to="/password-reset">
        Forget password?
      </router-link>
      <div v-if="siteSettings.allowSignup">
       • Don't have an account yet?
        <router-link to="/join">
          Sign up
        </router-link>
      </div>
    </div>
  </auth-form>
</template>

<script lang="ts">
export default {
	name: "Login"
}
</script>

<script setup lang="ts">
// packages
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../router"
import { signin } from "../modules/auth";
import { getPermissions } from "../modules/users";
import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"

// component
import AuthForm from "../layout/AuthForm.vue";
import LText from "../components/ui/input/LText.vue";
import Button from "../components/ui/Button.vue";
import SiteBranding from "../components/site/SiteBranding.vue";

const email = ref<string>("")
const emailError = reactive({
	show: false,
	message: ""
});

const password = ref<string>("")
const passwordError = reactive({
	show: false,
	message: ""
});
const buttonLoading = ref<boolean>(false)

const { get: siteSettings } = useSettingStore()
const { getUserId, setUser, setPermissions } = useUserStore()

function hideEmailError() {
	emailError.show = false;
	emailError.message = '';
};

function hidePasswordError() {
	passwordError.show = false;
	passwordError.message = '';
}

async function login() {
	if (!(email.value && password.value)) {
		if (!email.value) {
			emailError.show = true;
			emailError.message = "Required";
		}
		if (!password.value) {
			passwordError.show = true;
			passwordError.message = "Required";
		}
	}

	buttonLoading.value = true;

	try {
		const response = await signin({
      email: email.value,
      password: password.value
    });
		setUser(response.data.user)

		const permissions = await getPermissions();
		setPermissions(permissions.data.permissions);

		const route = router.currentRoute.value
		if (route.query.redirect) {
			router.push(route.query?.redirect.toString());
		} else {
			router.push("/");
		}
	} catch (error: any) {
		buttonLoading.value = false;

		if (error.response.data.code === "USER_NOT_FOUND") {
			emailError.show = true;
			emailError.message = "User not found";
		}

		if (error.response.data.code === "INCORRECT_PASSWORD") {
			passwordError.show = true;
			passwordError.message = "Incorrect password";
		}
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
	title: "Login",
	meta: [
		{
			name: "og:title",
			content: () => `Login • ${siteSettings.title}`
		}
	]
})
</script>
