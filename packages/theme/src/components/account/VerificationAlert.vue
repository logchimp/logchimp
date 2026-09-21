<template>
  <alert
    :title="t('auth_user.email_verification.title')"
    :description="t('auth_user.email_verification.description')"
    type="warning"
    class="mb-8"
  >
    <template #cta>
      <div class="flex items-center gap-x-4">
        <Button
          type="primary"
          :loading="loading"
          @click="sendEmailVerificationHandler"
        >
          {{ t("actions.resend") }}
        </Button>

        <div
          :class="[
            'flex items-center gap-x-2 transition-opacity',
            requestStatus.isShown ? 'opacity-100' : 'opacity-0',
          ]"
        >
          <!-- Success -->
          <template v-if="requestStatus.status === 'success'">
            <CheckCircle2Icon
              aria-hidden="true"
              class="size-5 stroke-green-600"
            />
            <span class="font-medium">
              {{ t("actions.email_sent_text") }}
            </span>
          </template>

          <!-- Error -->
          <template v-if="requestStatus.status === 'error'">
            <XCircleIcon aria-hidden="true" class="size-5 stroke-red-500" />
            <span class="font-medium">
              {{ t("actions.request_failed_text") }}
            </span>
          </template>
        </div>
      </div>
    </template>
  </alert>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import axios, { type AxiosResponse } from "axios";
import { CheckCircle2Icon, XCircleIcon } from "lucide-vue";
import type { IAuthEmailVerifyResponseBody } from "@logchimp/types";
import { useI18n } from "vue-i18n";

import { Alert } from "../ui/Alert";
import Button from "../ui/Button.vue";
import { VITE_API_URL } from "../../constants";
import { useUserStore } from "../../store/user";

const { authToken } = useUserStore();
const { t } = useI18n();
const loading = ref<boolean>(false);

interface IRequestStatus {
  isShown: boolean;
  status?: "success" | "error";
}

const requestStatus = reactive<IRequestStatus>({
  isShown: false,
});

async function sendEmailVerificationHandler() {
  loading.value = true;

  try {
    const res = await sendEmailVerification();

    requestStatus.isShown = true;
    if (res?.data?.verify?.success) {
      requestStatus.status = "success";
    } else {
      requestStatus.status = "error";
    }
  } catch (error: unknown) {
    requestStatus.isShown = true;
    requestStatus.status = "error";

    // if (error.response.data.code === "MAIL_CONFIG_MISSING") {
    //   serverError.value = true;
    // }

    console.error(error);
  } finally {
    loading.value = false;
    resetRequestStatus();
  }
}

async function sendEmailVerification(): Promise<
  AxiosResponse<IAuthEmailVerifyResponseBody>
> {
  return axios({
    method: "POST",
    url: `${VITE_API_URL}/api/v1/auth/email/verify`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
}

// Hide request status after timeout
function resetRequestStatus() {
  const timerDuration = requestStatus.status === "success" ? 2500 : 4000;

  setTimeout(() => {
    requestStatus.isShown = false;
  }, timerDuration);

  // After request status is visually hidden from UI
  setTimeout(
    () => {
      requestStatus.status = undefined;
    },
    timerDuration +
      // transition opacity duration
      150,
  );
}
</script>
