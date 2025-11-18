<template>
	<div class="flex items-start">
		<avatar :src="activity.author.avatar" :name="activity.author.name" />

		<div class="ml-4 flex-1">
			<div class="font-medium mb-1">{{ activity.author.name }}</div>
			<p class="mb-1 text-sm break-all">{{ activity.comment.body }}</p>

			<time
				:datetime="activity.created_at"
				:title="dayjs(activity.created_at).format('dddd, DD MMMM YYYY hh:mm')"
				class="post-date"
			>
				{{ dayjs(activity.created_at).fromNow() }}
			</time>
		</div>
	</div>
</template>

<script setup lang="ts">
// packages
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar } from "../../../components/ui/Avatar";

dayjs.extend(relativeTime);

defineProps({
  activity: {
    type: Object,
    required: true,
  },
});
</script>
