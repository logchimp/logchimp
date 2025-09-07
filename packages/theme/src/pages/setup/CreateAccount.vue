<template>
  <auth-layout>
    <div class="onboarding-header">
      <h2 class="onboarding-heading">
        {{ t("setupCreateAccount.heading") }}
      </h2>
    </div>
    <server-error v-if="serverError" @close="serverError = false" />
    <card>
      <l-text
        v-model="siteTitle.value"
        :label="t('setupCreateAccount.siteTitle.label')"
        type="text"
        name="Site title"
        :placeholder="t('setupCreateAccount.siteTitle.placeholder')"
        :error="siteTitle.error"
        @keyup-enter="createAccount"
        @hide-error="hideSiteTitleError"
      />
      <l-text
        v-model="fullName.value"
        :label="t('setupCreateAccount.fullName.label')"
        type="text"
        name="Full name"
        :placeholder="t('setupCreateAccount.fullName.placeholder')"
        :error="fullName.error"
        @keyup-enter="createAccount"
        @hide-error="hideFullNameError"
      />
      <l-text
        v-model="email.value"
        :label="t('setupCreateAccount.email.label')"
        type="text"
        name="Email address"
        :placeholder="t('setupCreateAccount.email.placeholder')"
        :error="email.error"
        @keyup-enter="createAccount"
        @hide-error="hideEmailError"
      />
      <l-text
        v-model="password.value"
        :label="t('setupCreateAccount.password.label')"
        type="password"
        name="Password"
        :placeholder="t('setupCreateAccount.password.placeholder')"
        :error="password.error"
        @keyup-enter="createAccount"
        @hide-error="hidePasswordError"
      />
      <div style="display: flex; justify-content: center">
        <Button :loading="buttonLoading" type="primary" @click="createAccount">
           {{ t("setupCreateAccount.cta") }}
        </Button>
      </div>
    </card>
    <!-- <p class="auth-form-other">
      By continuing, you agree to LogChimp's <strong>Terms</strong> and
      <strong>Privacy</strong> policy.
    </p> -->
  </auth-layout>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import { useI18n } from "vue-i18n";

// modules
import { router } from "../../router";
import { siteSetup } from "../../modules/site";
import { getPermissions } from "../../modules/users";
import { useSettingStore } from "../../store/settings";
import { useUserStore } from "../../store/user";

// components
import AuthLayout from "../../layout/AuthForm.vue";
import Card from "../../components/ui/Card.vue";
import type { FormFieldErrorType } from "../../components/ui/input/formBaseProps";
import ServerError from "../../components/serverError.vue";
import LText from "../../components/ui/input/LText.vue";
import Button from "../../components/ui/Button.vue";

const { get: siteSettings } = useSettingStore();
const { login, setPermissions } = useUserStore();
const { t } = useI18n();

const siteTitle = reactive({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const fullName = reactive({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const email = reactive({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const password = reactive({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const buttonLoading = ref(false);
const serverError = ref(false);

function hideSiteTitleError(event: FormFieldErrorType) {
  siteTitle.error = event;
}

function hideFullNameError(event: FormFieldErrorType) {
  fullName.error = event;
}

function hideEmailError(event: FormFieldErrorType) {
  email.error = event;
}

function hidePasswordError(event: FormFieldErrorType) {
  password.error = event;
}

async function createAccount() {
  if (!(siteTitle.value && fullName.value && email.value && password.value)) {
    if (!siteTitle.value) {
      siteTitle.error.show = true;
      siteTitle.error.message = t("setupCreateAccount.errors.required");
    }

    if (!fullName.value) {
      fullName.error.show = true;
      fullName.error.message = "Required";
    }

    if (!email.value) {
      email.error.show = true;
      email.error.message = "Required";
    }
    if (!password.value) {
      password.error.show = true;
      password.error.message = "Required";
    }
    return;
  }

  buttonLoading.value = true;

  try {
    const response = await siteSetup({
      siteTitle: siteTitle.value,
      name: fullName.value,
      email: email.value,
      password: password.value,
    });

    login(response.data.user);

    const permissions = await getPermissions();
    setPermissions(permissions.data.permissions);

    router.push("/setup/create-board");
  } catch (error: any) {
    if (error.response.data.code === "MAIL_CONFIG_MISSING") {
      serverError.value = true;
    }

    console.error(error);
  } finally {
    buttonLoading.value = false;
  }
}

useHead({
  title: "Create account • Onboarding",
  meta: [
    {
      name: "og:title",
      content: () => `Create account • Onboarding • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "SetupAccount",
});
</script>
