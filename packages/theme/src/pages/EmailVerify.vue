<template>
  <auth-form>
    <AuthFormHeader />

    <!-- Success -->
    <div v-if="success" class="card text-center flex flex-col items-center space-y-4">
      <success-icon class="w-8 h-8" color="#64B285" />

      <p>
        Thank you for verifying your account.
      </p>
      <AuthFormHelperText>
        You may close this window.
      </AuthFormHelperText>
    </div>

    <!-- Error -->
    <div v-if="error" class="card text-center flex flex-col items-center space-y-4">
      <error-icon class="w-8 h-8" color="#DE544E" />

      <p>
        Invalid or expired link. Please try again.
      </p>
      <AuthFormHelperText>
        Contact the site owner in case this happens again.
      </AuthFormHelperText>
    </div>

    <!-- Loading -->
    <loader-container v-if="loading" class="mt-16" />
  </auth-form>
</template>

<script setup lang="ts">
// packages
import { onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";
import { CheckCircle as SuccessIcon, XCircle as ErrorIcon } from "lucide-vue";

// modules
import { router } from "../router";
import { useSettingStore } from "../store/settings";
import { verifyUserEmail } from "../modules/auth";

// components
import AuthForm from "../layout/AuthForm.vue";
import AuthFormHelperText from "../components/auth/AuthFormHelperText.vue";
import LoaderContainer from "../components/ui/LoaderContainer.vue";
import AuthFormHeader from "../components/auth/AuthFormHeader.vue";

const { get: siteSettings } = useSettingStore();

const loading = ref(true);
const success = ref(false);
const error = ref(false);

async function verifyEmail() {
  const route = router.currentRoute.value;
  if (!route.query.token) {
    loading.value = false;
    error.value = true;
    return;
  }

  try {
    const token = route.query.token.toString();
    const response = await verifyUserEmail(token);

    if (response.data.verify.success) {
      success.value = true;
      loading.value = false;
    }
  } catch (err) {
    if (err.response.data.code === "USER_ALREADY_VERIFIED") {
      return router.push("/");
    }

    error.value = true;
    loading.value = false;
  }
}

onMounted(() => verifyEmail());

useHead({
  title: "Email verification",
  meta: [
    {
      name: "og:title",
      content: () => `Email verification · ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "EmailVerification",
});
</script>
