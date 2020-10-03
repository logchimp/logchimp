<template>
	<div class="input">
		<p v-if="label" class="input-field-label">{{ label }}</p>
		<input
			:type="type"
			class="input-field input-text"
			:class="{
				'input-field-disabled': disabled,
				'input-error': error.show
			}"
			:value="value"
			@input="$emit('input', $event.target.value)"
			@click="hideError"
			@keyup.enter="$emit('keyup-enter')"
			:placeholder="placeholder"
			:disabled="disabled"
		/>
		<p v-if="error.show" class="input-error-message">{{ error.message }}</p>
	</div>
</template>

<script>
export default {
	name: "LText",
	props: {
		label: {
			type: String,
			default: ""
		},
		type: {
			type: String,
			default: "text"
		},
		placeholder: {
			type: String,
			default: ""
		},
		value: {
			type: String,
			default: ""
		},
		disabled: {
			type: Boolean,
			default: false
		},
		error: {
			type: Object,
			default: () => {
				return {
					show: false,
					message: ""
				};
			}
		}
	},
	methods: {
		hideError() {
			this.$emit("hide-error", {
				show: false,
				message: ""
			});
		}
	}
};
</script>
