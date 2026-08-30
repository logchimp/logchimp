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
const errMsg = ref("");
const isError = ref(false);

const OIDC_ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    "You cancelled the sign-in request. Please try again if this was a mistake.",
  login_required: "Your session has expired. Please sign in again.",
  consent_required:
    "You need to approve the requested permissions to continue signing in.",
  interaction_required:
    "Additional action is required to complete sign-in. Please try again.",
  account_selection_required:
    "Please select an account to continue signing in.",
  temporarily_unavailable:
    "The sign-in service is temporarily unavailable. Please try again in a few minutes.",
  server_error:
    "Something went wrong with the sign-in provider. Please try again shortly.",
  invalid_request: "We couldn't process the sign-in request. Please try again.",
  unauthorized_client:
    "This application isn't authorized to sign you in. Please contact support.",
  unsupported_response_type:
    "Sign-in isn't configured correctly. Please contact support.",
  invalid_scope: "Sign-in isn't configured correctly. Please contact support.",
  authorization_failed:
    "We couldn't sign you in. Please try again, or contact support if the problem persists.",
};

async function onMountedHandler() {
  const error = (route.query?.error || "").toString();
  if (error) {
    if (error in OIDC_ERROR_MESSAGES) {
      setError(OIDC_ERROR_MESSAGES[error]);
    } else {
      setError();
    }

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

    Cookie.remove("lc-auth-token", {
      path: "/oauth/logchimp",
    });

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

function setError(msg?: string) {
  isError.value = true;
  errMsg.value = msg ?? "Authentication failed";
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
      {{errMsg}}
    </div>
  </auth-form>
</template>