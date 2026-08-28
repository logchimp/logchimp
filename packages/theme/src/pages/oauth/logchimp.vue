<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import AuthForm from "../../layout/AuthForm.vue";
import AuthFormHeader from "../../components/auth/AuthFormHeader.vue";
import Loader from "../../components/icons/Loader.vue";
import tokenError from "../../utils/tokenError.ts";
import type { AxiosError } from "axios";
import type { IApiErrorResponse } from "@logchimp/types";

const router = useRouter();
const isLoading = ref(true);
const isError = ref(false);

async function onMountedHandler() {
  try {
    const route = router.currentRoute.value;
    if (route.query.redirect) {
      router.push(route.query?.redirect.toString());
    } else {
      router.push("/");
    }
  } catch (error) {
    const err = error as AxiosError<IApiErrorResponse>;
    isError.value = true;
    tokenError(err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  isLoading.value = true;
  onMountedHandler();
});
</script>

<template>
  <auth-form>
    <AuthFormHeader />

    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center gap-y-3"
    >
      <Loader class="spinner stroke-neutral-800 size-6" />

      <div class="text-neutral-700">
        Please do not refresh the page.
      </div>
    </div>
    <div
      v-if="isError"
      class="text-center"
    >
      Authentication failed
    </div>
  </auth-form>
</template>