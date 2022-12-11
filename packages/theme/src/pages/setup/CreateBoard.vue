<template>
  <auth-form>
    <div class="onboarding-header">
      <h2 class="onboarding-heading">
        Create a new board
      </h2>
      <p class="onboarding-label">
        A board is a place where people can post and vote on ideas for a
        specific topic.
      </p>
    </div>
    <div class="card">
      <l-text
        v-model="boardName.value"
        label="Name"
        type="text"
        name="Name"
        placeholder="Name of the board"
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
          Create
        </Button>
      </div>
    </div>

    <div class="auth-form-other">
      You can <router-link to="/dashboard">skip</router-link> and create one later.
    </div>
  </auth-form>
</template>

<script lang="ts">
export default {
	name: "SetupBoard",
}
</script>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../../router";
import { useSettingStore } from "../../store/settings";
import { useUserStore } from "../../store/user";
import { createBoard } from "../../modules/boards";

// components
import AuthForm from "../../layout/AuthForm.vue";
import { FormFieldErrorType } from "../../components/ui/input/formBaseProps";
import LText from "../../components/ui/input/LText.vue";
import Button from "../../components/ui/Button.vue";

const boardName = reactive({
	value: "",
	error: {
		show: false,
		message: ""
	}
})
const buttonLoading = ref(false)

const { get: siteSettings } = useSettingStore()
const { permissions } = useUserStore()

const createBoardPermissionDisabled = computed(() => {
	const checkPermission = permissions.includes("board:create");
	return !checkPermission;
})

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
			content: () => `Create board • Onboarding • ${siteSettings.title}`
		}
	]
})
</script>
