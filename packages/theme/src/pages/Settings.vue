<template>
  <div>
    <h4 class="form-header" data-testid="page-title">Account settings</h4>
    <loader-container v-if="loading" />
    <div v-else>
      <server-error v-if="serverError" @close="serverError = false" />

      <!-- Account verification alert -->
      <AccountVerificationAlert v-if="!isVerified" class="mb-8" />

      <form
        data-testid="settings-form"
        class="space-y-4"
        @submit.prevent="updateSettings"
      >
        <l-text
          v-model="name.value"
          :label="t('auth_user.settings.name_label')"
          type="text"
          name="Name"
          :placeholder="t('auth_user.settings.name_placeholder')"
          class="user-settings-name-item"
          :error="name.error"
          @keyup-enter="updateSettings"
          @hide-error="hideNameError"
        />
        <l-text
          v-model="user.username"
          :label="t('auth_user.settings.username_label')"
          type="text"
          name="Username"
          :placeholder="t('auth_user.settings.username_placeholder')"
          :disabled="true"
        />
        <l-text
          v-model="user.email"
          :label="t('auth_user.settings.email_address_label')"
          type="text"
          name="Email Address"
          :placeholder="t('auth_user.settings.email_address_placeholder')"
          :disabled="true"
        />

        <div>
          <Button
            type="primary"
            :loading="updateUserButtonLoading"
            @click="updateSettings"
          >
            {{ t("actions.save") }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import type { AxiosError } from "axios";
import type { IApiErrorResponse } from "@logchimp/types";
import { useI18n } from "vue-i18n";

// modules
import { router } from "../router";
import { UsersAPI } from "../modules/users";
import { useSettingStore } from "../store/settings";
import { useUserStore } from "../store/user";
import tokenError from "../utils/tokenError";

// components
import LoaderContainer from "../components/ui/LoaderContainer.vue";
import ServerError from "../components/serverError.vue";
import LText from "../components/ui/input/LText.vue";
import Button from "../components/ui/Button.vue";
import type { FormFieldErrorType } from "../components/ui/input/formBaseProps";
import AccountVerificationAlert from "../components/account/VerificationAlert.vue";

const { get: siteSettings } = useSettingStore();
const { getUserId } = useUserStore();
const usersAPI = new UsersAPI();
const { t } = useI18n();

const user = reactive({
  username: "",
  email: "",
});

const name = reactive({
  value: "",
  error: {
    show: false,
    message: "",
  },
});

const loading = ref<boolean>(false);
const isVerified = ref<boolean>(false);
const serverError = ref<boolean>(false);
const updateUserButtonLoading = ref<boolean>(false);

async function getUser() {
  loading.value = true;

  try {
    const response = await usersAPI.GetUserSettings();

    name.value = response.user.name;
    user.username = response.user.username;
    user.email = response.user.email;
    isVerified.value = response.user.isVerified;
  } catch (error) {
    const err = error as AxiosError<IApiErrorResponse>;
    tokenError(err);
  } finally {
    loading.value = false;
  }
}

async function updateSettings() {
  updateUserButtonLoading.value = true;

  try {
    const response = await usersAPI.UpdateUserSettings({
      name: name.value,
    });

    name.value = response.user.name;
    updateUserButtonLoading.value = false;
    // TODO: Add TS types
    // biome-ignore lint: Add TS types
  } catch (error: any) {
    updateUserButtonLoading.value = false;

    Object.assign(name.error, {
      message: error.response.data.name,
      show: true,
    });
  }
}

function hideNameError(value: FormFieldErrorType) {
  Object.assign(name.error, value);
}

onMounted(() => {
  if (getUserId) {
    getUser();
  } else {
    router.push({
      path: "/login",
      query: {
        redirect: "/settings",
      },
    });
  }
});

useHead({
  title: "User settings",
  meta: [
    {
      name: "og:title",
      content: () => `User settings • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "UserAccountSettings",
});
</script>
