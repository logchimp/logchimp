<template>
  <div class="card">
    <l-text
      v-model="title.value"
      label="Title"
      type="text"
      name="Post title"
      data-test="post-title"
      placeholder="Name of the feature"
      :error="title.error"
      :disabled="createPostPermissionDisabled"
      @keyup-enter="submitPost"
      @hide-error="hideTitleError"
    />
    <l-textarea
      v-model="description"
      label="Description"
      rows="4"
      name="Post description"
      placeholder="What would you use it for?"
      :disabled="createPostPermissionDisabled"
    />
    <div style="display: flex; justify-content: center;">
      <Button
        type="primary"
        data-test="create-post-button"
        :loading="loading"
        :disabled="createPostPermissionDisabled"
        @click="submitPost"
      >
        Submit
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

// modules
import { createPost } from "../../modules/posts";
import { useUserStore } from "../../store/user"
import { router } from "../../router";

// components
import { FormFieldErrorType } from "../ui/input/formBaseProps";
import LText from "../ui/input/LText.vue";
import LTextarea from "../ui/input/LTextarea.vue";
import Button from "../ui/Button.vue";

// utils
import validateUUID from "../../utils/validateUUID";
import tokenError from "../../utils/tokenError";

const { permissions } = useUserStore()

const props = defineProps({
	boardId: {
		type: String,
		required: true,
		validator: validateUUID
	},
	dashboard: {
		type: Boolean,
		default: false
	}
})

const title = reactive({
	value: "",
	error: {
		show: false,
		message: ""
	}
})
const description = ref<string>("")
const loading = ref<boolean>(false)

const dashboardUrl = computed(() => props.dashboard ? "/dashboard" : "")
const createPostPermissionDisabled = computed(() => {
	const checkPermission = permissions.includes("post:create");
	return !checkPermission;
})

function hideTitleError(event: FormFieldErrorType) {
	title.error = event;
}

async function submitPost() {
	if (!title.value) {
		title.error.show = true;
		title.error.message = "You forgot to enter a post title";
		return;
	}

	loading.value = true;
	const postObject = {
		title: title.value,
		contentMarkdown: description.value
	};

	try {
		const response = await createPost(props.boardId, postObject);

		// redirect to post
		const slug = response.data.post.slug;
		router.push(`${dashboardUrl.value}/posts/${slug}`);
	} catch (error) {
		tokenError(error);
	} finally {
		loading.value = false;
	}
}
</script>
