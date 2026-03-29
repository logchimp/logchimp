<template>
	<div
    :class="[
      'p-8 border bg-white rounded-(--border-radius-default)',
      isInternal ? [
        'ring-4 ring-(--color-logchimp-brand-color)/10 border-(--color-logchimp-brand-color)',
      ] : 'border-(--color-gray-90)',
    ]"
  >
		<l-text
			v-model="comment"
			name="comment"
			placeholder="Leave a comment"
			@keyup-enter="submitComment"
		/>

		<div class="flex items-center justify-end space-x-8">
      <Tooltip v-if="allowInternal">
        <template #trigger>
          <toggle v-model="isInternal" />
        </template>

        Comment will only be visible to team members.
      </Tooltip>

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
import { ref, withDefaults } from "vue";
import type { IPostActivity } from "@logchimp/types";

// modules
import { addComment } from "../../modules/posts";
import tokenError from "../../../utils/tokenError";

// components
import LText from "../../../components/ui/input/LText.vue";
import Button from "../../../components/ui/Button.vue";
import Toggle from "../../../components/ui/input/Toggle.vue";
import Tooltip from "../../../components/ui/Tooltip/Tooltip.vue";

interface Props {
  postId: string;
  allowInternal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  allowInternal: false,
});

const emit = defineEmits<{
  (e: "add-comment", comment: IPostActivity): void;
}>();

const comment = ref("");
const isInternal = ref(false);
const loading = ref(false);

async function submitComment() {
  if (!comment.value) return;

  try {
    loading.value = true;

    const response = await addComment(props.postId, {
      body: comment.value,
      is_internal: isInternal.value,
    });

    comment.value = "";
    loading.value = false;

    emit("add-comment", response?.data?.activity);
  } catch (error) {
    tokenError(error);
    loading.value = false;
  }
}
</script>
