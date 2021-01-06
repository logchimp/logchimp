<template>
	<div class="avatar-stack">
		<img
			data-test="avatar-stack-image"
			class="avatar-stack-image"
			v-for="avatar in avatars"
			:key="avatar.userId"
			:src="avatar.avatar"
			:alt="avatar.username"
		/>
		<div
			v-if="!hideMoreStack"
			data-test="avatar-stack-more"
			class="avatar-stack-more"
		>
			{{ "+" + moreStack }}
		</div>
	</div>
</template>

<script>
export default {
	name: "AvatarStack",
	props: {
		avatars: {
			type: Array,
			required: true
		},
		totalCount: {
			type: Number,
			required: true
		}
	},
	computed: {
		hideMoreStack() {
			return this.totalCount <= 6;
		},
		moreStack() {
			return this.totalCount - 6;
		}
	}
};
</script>
