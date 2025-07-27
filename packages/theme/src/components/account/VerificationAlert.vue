<template>
  <alert
    title="Email verification"
    description="We’ve sent you an verification email. Please follow the instructions in the email."
    type="warning"
    class="mb-8"
  >
    <template #cta>
      <Button
        type="primary"
        :loading="loading"
        @click="sendEmailVerificationHandler"
      >
        Resend
      </Button>
    </template>
  </alert>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

import { Alert } from "../ui/Alert";
import Button from "../ui/Button.vue";
import { VITE_API_URL } from "../../constants";
import { useUserStore } from "../../store/user";

const { getUser } = useUserStore();
const loading = ref<boolean>(false);

async function sendEmailVerificationHandler() {
  loading.value = true;

  try {
    const res = await axios({
      method: "POST",
      url: `${VITE_API_URL}/api/v1/auth/email/verify`,
      data: {
        email: getUser.email,
      },
    });

    console.log("res");
    console.log(res);
  } catch (error: unknown) {
    // if (error.response.data.code === "MAIL_CONFIG_MISSING") {
    //   serverError.value = true;
    // }

    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>
