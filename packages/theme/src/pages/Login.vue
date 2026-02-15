<template>
  <auth-form>
    <AuthFormHeader>
      <template #heading>
        Welcome back!
      </template>
    </AuthFormHeader>

    <form class="card" data-testid="login-form" @submit.prevent="login">
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

      <div class="flex justify-center">
        <Button
          type="primary"
          :loading="buttonLoading"
          @click="login"
        >
          Login
        </Button>
      </div>
    </form>

    <AuthFormHelperText>
      <router-link to="/password-reset">
        Forgot password?
      </router-link>
      <div v-if="siteSettings.allowSignup">
       • Don't have an account yet?
        <router-link to="/join">
          Sign up
        </router-link>
      </div>
    </AuthFormHelperText>
  </auth-form>
</template>

<script setup lang="ts">
// packages
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../router";
import { signin } from "../modules/auth";
import { getPermissions } from "../modules/users";
import { useSettingStore } from "../store/settings";
import { useUserStore } from "../store/user";

// component
import AuthForm from "../layout/AuthForm.vue";
import AuthFormHelperText from "../components/auth/AuthFormHelperText.vue";
import LText from "../components/ui/input/LText.vue";
import Button from "../components/ui/Button.vue";
import AuthFormHeader from "../components/auth/AuthFormHeader.vue";

const email = ref<string>("");
const emailError = reactive({
  show: false,
  message: "",
});

const password = ref<string>("");
const passwordError = reactive({
  show: false,
  message: "",
});
const buttonLoading = ref<boolean>(false);

const { get: siteSettings } = useSettingStore();
const { getUserId, setUser, setPermissions } = useUserStore();

function hideEmailError() {
  emailError.show = false;
  emailError.message = "";
}

function hidePasswordError() {
  passwordError.show = false;
  passwordError.message = "";
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
      password: password.value,
    });
    setUser(response.data.user);

    const permissions = await getPermissions();
    setPermissions(permissions.data.permissions);

    const route = router.currentRoute.value;
    if (route.query.redirect) {
      router.push(route.query?.redirect.toString());
    } else {
      router.push("/");
    }
  } catch (error: any) {
    buttonLoading.value = false;

    if (error.response.data.code === "EMAIL_INVALID") {
      emailError.show = true;
      emailError.message = "Invalid email";
    }

    if (error.response.data.code === "USER_NOT_FOUND") {
      emailError.show = true;
      emailError.message = "User not found";
    }

    if (error.response.data.code === "EMAIL_DOMAIN_BLACKLISTED") {
      emailError.show = true;
      emailError.message = "Email domain is blacklisted";
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
    const route = router.currentRoute.value;
    if (route.query.redirect) {
      router.push(route.query?.redirect.toString());
    } else {
      router.push("/");
    }
  }
});

useHead({
  title: "Login",
  meta: [
    {
      name: "og:title",
      content: () => `Login • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "Login",
});
</script>
