<template>
  <auth-form>
    <AuthFormHeader>
      <template #heading>
        Forgot password
      </template>
    </AuthFormHeader>

    <server-error v-if="serverError" @close="serverError = false" />
    <div v-if="!hideForm" class="card">
      <l-text
        v-model="email"
        label="Email Address"
        type="email"
        name="email"
        placeholder="Email address"
        :error="emailError"
        @keyup-enter="forgetPassword"
        @hide-error="hideEmailError"
      />
      <div style="display: flex; justify-content: center">
        <Button type="primary" :loading="buttonLoading" @click="forgetPassword">
          Continue
        </Button>
      </div>
    </div>
    <div v-if="requestSuccess" class="card">
      <p>You will receive a password reset email soon.</p>
      <br>
      <p>Follow the link in the email to reset your password.</p>
    </div>
    <div v-if="requestError" class="card">
      <p>Something went wrong!</p>
    </div>
    <AuthFormHelperText v-if="siteSettings.allowSignup">
      Don't have an account yet?
      <router-link to="/join">
        Sign up
      </router-link>
    </AuthFormHelperText>
  </auth-form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import type { AxiosError } from "axios";
import type { IApiErrorResponse } from "@logchimp/types";

// modules
import { requestPasswordReset } from "../../modules/auth";
import { useSettingStore } from "../../store/settings";

// component
import AuthForm from "../../layout/AuthForm.vue";
import AuthFormHelperText from "../../components/auth/AuthFormHelperText.vue";
import type { FormFieldErrorType } from "../../components/ui/input/formBaseProps";
import ServerError from "../../components/serverError.vue";
import LText from "../../components/ui/input/LText.vue";
import Button from "../../components/ui/Button.vue";
import AuthFormHeader from "../../components/auth/AuthFormHeader.vue";

const { get: siteSettings } = useSettingStore();

const email = ref("");
const emailError = reactive({
  show: false,
  message: "",
});

const hideForm = ref(false);
const requestSuccess = ref(false);
const requestError = ref(false);
const buttonLoading = ref(false);
const serverError = ref(false);

function hideEmailError(event: FormFieldErrorType) {
  emailError.message = event.message;
  emailError.show = event.show;
}

async function forgetPassword() {
  if (!email.value) {
    emailError.show = true;
    emailError.message = "Required";
    return;
  }

  buttonLoading.value = true;

  try {
    const response = await requestPasswordReset(email.value);

    hideForm.value = true;
    if (response.data.reset.success) {
      requestSuccess.value = true;
    } else {
      requestError.value = true;
    }
  } catch (error) {
    const err = error as AxiosError<IApiErrorResponse>;
    if (err.response?.data?.code === "MAIL_CONFIG_MISSING") {
      serverError.value = true;
    }

    if (err.response?.data?.code === "USER_NOT_FOUND") {
      emailError.show = true;
      emailError.message = "User not found";
    }
  } finally {
    buttonLoading.value = false;
  }
}

useHead({
  title: "Forgot password",
  meta: [
    {
      name: "og:title",
      content: () => `Forgot password • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "ForgotPassword",
});
</script>