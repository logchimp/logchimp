<template>
	<div class="avatar" @click="$emit('click')">
		<div v-if="src" class="avatar-image">
			<img :src="src" :alt="fullName" class="avatar-image-img" />
		</div>
		<div v-else class="avatar-initials">
			{{ initals }}
		</div>
	</div>
</template>

<script>
export default {
	name: "Avatar",
	props: {
		src: {
			type: String,
			default: ""
		},
		name: {
			type: String,
			default: ""
		}
	},
	computed: {
		fullName() {
			return this.firstName + " " + this.lastName;
		},
		initals() {
			return this.name.slice(0, 1);
		}
	}
};
</script>
