<template>
	<div class="card">
		<l-text
			v-model="comment"
			name="comment"
			placeholder="Leave a comment"
			@keyup-enter="submitComment"
		/>

		<div style="display: flex; justify-content: flex-end">
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
import { ref } from "vue"

// modules
import { addComment } from "../../modules/posts";
import tokenError from "../../utils/tokenError";

// components
import LText from "../ui/input/LText.vue";
import Button from "../ui/Button.vue";

const props = defineProps({
	postId: {
		type: String,
		required: true,
	}
})

const emit = defineEmits(['add-comment'])

const comment = ref("");
const loading = ref(false)

async function submitComment() {
	if (!comment.value) return;

	try {
		loading.value = true;

		const response = await addComment({
			post_id: props.postId,
			body: comment.value,
			is_internal: false,
		})

		comment.value = "";
		loading.value = false;

		emit('add-comment', response.data.comment)
	} catch (error) {
		tokenError(error)
		loading.value = false
	}
}
</script>
