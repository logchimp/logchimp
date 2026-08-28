<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Cookie from "js-cookie";

import AuthForm from "../../layout/AuthForm.vue";
import AuthFormHeader from "../../components/auth/AuthFormHeader.vue";
import Loader from "../../components/icons/Loader.vue";
import { useUserStore } from "../../store/user.ts";
import tokenError from "../../utils/tokenError.ts";
import type { AxiosError } from "axios";
import type { IApiErrorResponse } from "@logchimp/types";
import { getPermissions } from "../../modules/users.ts";
import { AuthAPIService } from "../../modules/auth.ts";

const route = useRoute();
const router = useRouter();
const { setAuthToken, setUser, setPermissions } = useUserStore();
const isLoading = ref(true);
const isError = ref(false);

async function onMountedHandler() {
  const error = (route.query?.error || "").toString();
  if (error === "not_allowed") {
    setError();
    return;
  }

  const authCookie = Cookie.get("lc-auth-token");
  if (!authCookie) {
    setError();
    return;
  }

  setAuthToken(authCookie);

  try {
    const authService = new AuthAPIService();
    const getAuthUser = await authService.getMe();
    setUser({
      authToken: authCookie,
      ...getAuthUser.user,
    });
    const permissions = await getPermissions();
    setPermissions(permissions.data.permissions);

    const route = router.currentRoute.value;
    if (route.query.redirect) {
      router.push(route.query?.redirect.toString());
    } else {
      router.push("/");
    }
  } catch (error) {
    isError.value = true;

    const err = error as AxiosError<IApiErrorResponse>;
    tokenError(err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  isLoading.value = true;
  onMountedHandler();
});

function setError() {
  isError.value = true;
  isLoading.value = false;
}
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