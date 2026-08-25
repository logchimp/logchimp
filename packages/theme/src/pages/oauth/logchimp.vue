<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import AuthForm from "../../layout/AuthForm.vue";
import AuthFormHeader from "../../components/auth/AuthFormHeader.vue";
import Loader from "../../components/icons/Loader.vue";
import { ssoLogChimpAuthenticate } from "../../modules/auth.ts";
import { useUserStore } from "../../store/user.ts";
import { getPermissions } from "../../modules/users.ts";

const router = useRouter();
const route = useRoute();
const { setUser, setPermissions } = useUserStore();
const isLoading = ref(true);
const isError = ref(false);

async function onMountedHandler(code: string) {
  try {
    const response = await ssoLogChimpAuthenticate({ code });
    setUser(response.data.user);

    const permissions = await getPermissions();
    setPermissions(permissions.data.permissions);

    const route = router.currentRoute.value;
    if (route.query.redirect) {
      router.push(route.query?.redirect.toString());
    } else {
      router.push("/");
    }
  } catch (_error) {
    // const err = error as AxiosError<IApiErrorResponse>;
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  const code = (route.query?.code || "").toString();
  if (code) {
    isLoading.value = true;
    onMountedHandler(code);
  } else {
  }
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