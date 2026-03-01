<template>
	<div class="card">
		<l-text
			v-model="comment"
			name="comment"
			placeholder="Leave a comment"
			@keyup-enter="submitComment"
		/>

		<div class="flex justify-end">
			<Button
				type="primary"
				:loading="loading"
				:disabled="!comment"
				@click="submitComment"
			>
				Submit
			</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { IPostActivity } from "@logchimp/types";

// modules
import { addComment } from "../../modules/posts";
import tokenError from "../../../utils/tokenError";

// components
import LText from "../../../components/ui/input/LText.vue";
import Button from "../../../components/ui/Button.vue";

interface Props {
  postId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "add-comment", comment: IPostActivity): void;
}>();

const comment = ref("");
const loading = ref(false);

async function submitComment() {
  if (!comment.value) return;

  try {
    loading.value = true;

    const response = await addComment(props.postId, {
      body: comment.value,
      is_internal: false,
    });

    comment.value = "";
    loading.value = false;

    emit("add-comment", response?.data?.comment);
  } catch (error) {
    tokenError(error);
    loading.value = false;
  }
}
</script>
