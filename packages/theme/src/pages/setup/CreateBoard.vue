<template>
  <auth-form>
    <div class="onboarding-header">
      <h2 class="onboarding-heading">
        {{t("setupCreateBoard.heading")}}
      </h2>
      <p class="onboarding-label">
       {{t("setupCreateBoard.label")}}
      </p>
    </div>
    <div class="card">
      <l-text
        v-model="boardName.value"
        :label="t('setupCreateBoard.card.label')"
        type="text"
        name="Name"
        :placeholder="t('setupCreateBoard.card.placeholder')"
        :error="boardName.error"
        @keyup-enter="create"
        @hide-error="hideBoardNameError"
      />
      <div style="display: flex; justify-content: center;">
        <Button
          :loading="buttonLoading"
          :disabled="createBoardPermissionDisabled"
          type="primary"
          @click="create"
        >
         {{t("setupCreateBoard.create")}}
        </Button>
      </div>
    </div>

    <div class="auth-form-other">
      <i18n-t keypath="setupCreateAccount.skipText">
      <router-link to="/dashboard" place="skip">
         {{ t("setupCreateAccount.skipWord") }}
      </router-link>
    </i18n-t>
    </div>
  </auth-form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import { useI18n } from "vue-i18n";

// modules
import { router } from "../../router";
import { useSettingStore } from "../../store/settings";
import { useUserStore } from "../../store/user";
import { createBoard } from "../../ee/modules/boards";

// components
import AuthForm from "../../layout/AuthForm.vue";
import type { FormFieldErrorType } from "../../components/ui/input/formBaseProps";
import LText from "../../components/ui/input/LText.vue";
import Button from "../../components/ui/Button.vue";

const boardName = reactive({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const buttonLoading = ref(false);

const { get: siteSettings } = useSettingStore();
const { permissions } = useUserStore();

const createBoardPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("board:create");
  return !checkPermission;
});

const { t } = useI18n();

function hideBoardNameError(event: FormFieldErrorType) {
  boardName.error = event;
}

async function create() {
  if (!boardName.value) {
    boardName.error.show = true;
    boardName.error.message = "Required";
    return;
  }

  buttonLoading.value = true;

  try {
    await createBoard({
      name: boardName.value,
      display: true,
    });

    router.push("/dashboard");
  } catch (error) {
    console.error(error);
    buttonLoading.value = false;
  }
}

useHead({
  title: "Create board • Onboarding",
  meta: [
    {
      name: "og:title",
      content: () => `Create board • Onboarding • ${siteSettings.title}`,
    },
  ],
});

defineOptions({
  name: "SetupBoard",
});
</script>
