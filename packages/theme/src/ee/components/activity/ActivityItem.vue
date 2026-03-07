<template>
	<div class="flex items-start">
		<avatar
      :src="activity.author.avatar"
      :name="activity.author.name || activity.author.username"
    />

		<div class="ml-4 flex-1">
			<div class="font-medium mb-1">{{ activity.author.name }}</div>
			<p class="mb-0.5 text-sm break-all">{{ activity.comment.body }}</p>

			<div class="flex items-center gap-1.5 text-xs text-neutral-600">
				<time
					:datetime="dayjs(activity.created_at).toISOString()"
					:title="dayjs(activity.created_at).format('dddd, DD MMMM YYYY hh:mm')"
				>
					{{ dayjs(activity.created_at).fromNow() }}
				</time>
				<span v-if="activity.comment.is_edited" class="text-neutral-400">&middot; Edited</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import type { IPostActivity } from "@logchimp/types";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar } from "../../../components/ui/Avatar";

dayjs.extend(relativeTime);

interface Props {
  activity: IPostActivity;
}
defineProps<Props>();
</script>
