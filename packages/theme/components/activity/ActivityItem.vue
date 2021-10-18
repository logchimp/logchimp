<template>
	<div class="activity-item-wrapper">
		<avatar :src="activity.author.avatar" :name="activity.author.name" />

		<div class="activity-item-content">
			<h6>{{ activity.author.name }}</h6>
			<p>{{ activity.comment.body }}</p>

			<time
				:datetime="activity.created_at"
				:title="$dayjs(activity.created_at).format('dddd, DD MMMM YYYY hh:mm')"
				class="post-date"
			>
				{{ $dayjs(activity.created_at).from() }}
			</time>
		</div>
	</div>
</template>

<script>
// components
import Avatar from "../ui/Avatar.vue";

export default {
	name: "ActivityItem",
	components: {
		// components
		Avatar
	},
	props: {
		activity: {
			type: Object,
			required: true
		}
	}
};
</script>

<style lang='sass'>
.activity-item-wrapper
	display: flex
	align-items: flex-start
	margin-bottom: 1.25rem

	&:last-child
		margin-bottom: 0

.activity-item-content
	margin-left: 1rem

	h6
		margin-bottom: 0.25rem

	p
		margin-bottom: 0.25rem
		font-size: 0.95rem
		line-height: 22px
</style>
