<template>
  <auth-form>
    <AuthFormHeader>
      <template #heading>
        Create your account
      </template>
    </AuthFormHeader>

    <server-error v-if="serverError" @close="serverError = false" />

    <form class="card" data-testid="signup-form" @submit.prevent="join">
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

      <div class="flex justify-center">
        <Button
          type="primary"
          :loading="buttonLoading"
          :disabled="!siteSettings.allowSignup"
          @click="join"
        >
          Create Account
        </Button>
      </div>
    </form>

    <AuthFormHelperText>
      Already have an account?
      <router-link to="/login">
        Log in
      </router-link>
    </AuthFormHelperText>
  </auth-form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../router";
import { signup } from "../modules/auth";
import { getPermissions } from "../modules/users";
import { useSettingStore } from "../store/settings";
import { useUserStore } from "../store/user";

// component
import AuthForm from "../layout/AuthForm.vue";
import AuthFormHelperText from "../components/auth/AuthFormHelperText.vue";
import type { FormFieldErrorType } from "../components/ui/input/formBaseProps";
import ServerError from "../components/serverError.vue";
import LText from "../components/ui/input/LText.vue";
import Button from "../components/ui/Button.vue";
import AuthFormHeader from "../components/auth/AuthFormHeader.vue";

const { get: siteSettings } = useSettingStore();
const { getUserId, login, setPermissions } = useUserStore();

const email = ref("");
const emailError = reactive({
  show: false,
  message: "",
});
const password = ref("");
const passwordError = reactive({
  show: false,
  message: "",
});
const buttonLoading = ref(false);
const serverError = ref(false);

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
      password: password.value,
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

    if (error.response.data.code === "EMAIL_INVALID") {
      emailError.show = true;
      emailError.message = "Invalid email";
    }

    if (error.response.data.code === "USER_EXISTS") {
      emailError.show = true;
      emailError.message = "Exists";
    }

    if (error.response.data.code === "EMAIL_DOMAIN_BLACKLISTED") {
      emailError.show = true;
      emailError.message = "Email domain is blacklisted";
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
    const route = router.currentRoute.value;
    if (route.query.redirect) {
      router.push(route.query?.redirect.toString());
    } else {
      router.push("/");
    }
  }
});

useHead({
  title: "Join",
  meta: [
    {
      name: "og:title",
      content: () => `Join • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "Join",
});
</script>
