<template>
	<div class="flex items-start group">
		<avatar
      :src="activity.author.avatar"
      :name="activity.author.name || activity.author.username"
    />

		<div class="ml-4 flex-1">
      <div class="flex items-center mb-1">
        <div class="font-medium">
          {{ activity.author.name }}
        </div>

        <div class="flex items-center" v-if="activity.comment.is_internal">
          <span class="mx-2 text-xs text-neutral-500">•</span>
          <LockKeyhole class="size-4 stroke-neutral-700" />
        </div>
      </div>

      <div
        class="mb-2"
        v-if="isEditing"
      >
        <l-textarea
          class="w-full mb-2!"
          :model-value="comment"
          @update:model-value="comment = $event"
        />
        <div class="flex justify-end mt-0.5">
          <LButton type="primary" size="small" @click="updateCommentHandler">
            Save
          </LButton>
        </div>
      </div>
			<p v-else class="mb-0.5 text-sm break-all">
        {{ activity.comment.body }}
      </p>

			<div class="flex items-center gap-1.5 text-xs text-neutral-600">
				<time
					:datetime="dayjs(activity.created_at).toISOString()"
					:title="dayjs(activity.created_at).format('dddd, DD MMMM YYYY hh:mm')"
				>
					{{ dayjs(activity.created_at).fromNow() }}
				</time>
        <span v-if="activity.comment.is_edited">&middot; Edited</span>
        <div
          v-if="commentAuthor && !isEditing"
          class="hidden group-hover:flex items-center gap-1.5"
          @click="isEditing = !isEditing"
        >
          &middot;
          <button type="button" class="cursor-pointer">
            Edit comment
          </button>
        </div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";
import type { IApiErrorResponse, IPostActivity } from "@logchimp/types";
import { LockKeyhole } from "lucide-vue";
import relativeTime from "dayjs/plugin/relativeTime";

import { useUserStore } from "../../../store/user";
import { updateComment } from "../../modules/posts";

import { Avatar } from "../../../components/ui/Avatar";
import LTextarea from "../../../components/ui/input/LTextarea.vue";
import LButton from "../../../components/ui/Button.vue";
import type { AxiosError } from "axios";
import tokenError from "../../../utils/tokenError.ts";

dayjs.extend(relativeTime);
const { permissions, getUserId } = useUserStore();

interface Props {
  postId: string;
  activity: IPostActivity;
}
const props = defineProps<Props>();

const isLoading = ref(false);
const isEditing = ref(false);
const comment = ref(props.activity.comment.body);

const commentAuthor = computed(() => {
  const commentUpdateAny = permissions.includes("comment:update:any");
  const commentUpdateOwn = permissions.includes("comment:update:own");

  if (commentUpdateAny) return true;
  if (commentUpdateOwn) return props.activity.author.userId === getUserId;
  return false;
});

async function updateCommentHandler() {
  if (!comment.value) return;
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    const res = await updateComment(props.postId, props.activity.comment.id, {
      body: comment.value,
    });

    if (res.status === 200) {
      isEditing.value = false;
    }
  } catch (error) {
    const err = error as AxiosError<IApiErrorResponse>;
    tokenError(err);
  } finally {
    isLoading.value = false;
  }
}
</script>
