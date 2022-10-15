<template>
	<div :class="$style.root">
		<avatar :src="activity.author.avatar" :name="activity.author.name" />

		<div :class="$style.content">
			<h6>{{ activity.author.name }}</h6>
			<p>{{ activity.comment.body }}</p>

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
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import { Avatar } from "../ui/Avatar";

dayjs.extend(relativeTime);

defineProps({
	activity: {
		type: Object,
		required: true
	}
})
</script>

<style lang='sass' module>
.root
	display: flex
	align-items: flex-start
	margin-bottom: 1.25rem

	&:last-child
		margin-bottom: 0

.content
	margin-left: 1rem

	h6
		margin-bottom: 0.25rem

	p
		margin-bottom: 0.25rem
		font-size: 0.95rem
		line-height: 22px
</style>
