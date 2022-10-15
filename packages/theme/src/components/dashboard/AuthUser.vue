<template>
	<div :class="$style.bg">
		<div :class="$style.container">
			<avatar
				:src="avatar"
				:name="name || username"
			/>
			<div :class="$style.info">
				<p :class="$style.name">
					{{ name || username }}
				</p>
				<span :class="$style.email">
					{{ email }}
				</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Avatar } from "../ui/Avatar";

export default {
	name: "DashboardAuthUser",
	components: {
		// components
		Avatar,
	},
	props: {
		name: String,
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		avatar: {
			type: String,
			required: true,
		},
	}
}
</script>

<style lang='sass' module>
.bg
	cursor: pointer
	border-radius: var(--border-radius-default)
	padding: 0.625rem 1rem

	&:hover
		background-color: rgba(255, 255, 255, 0.1)

.container
	display: grid
	grid-template-columns: 2rem 1fr
	grid-column-gap: 0.625rem
	align-items: center

.info
	overflow: hidden
	user-select: none

@mixin truncateText
	white-space: nowrap
	overflow: hidden
	text-overflow: ellipsis

.name
	font-weight: 600
	color: var(--color-white)
	@include truncateText

.email
	color: rgba(255, 255, 255, 0.5)
	font-size: 0.875rem
	@include truncateText
</style>
