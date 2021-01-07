<template>
	<label class="input">
		<p v-if="label" class="input-field-label">{{ label }}</p>
		<input
			:type="type"
			data-test="input-field"
			class="input-field input-text"
			:class="{
				'input-field-disabled': disabled,
				'input-error': error.show
			}"
			:value="value"
			@input="$emit('input', $event.target.value)"
			@click="hideError"
			@keyup.enter="keyUpEnter"
			:placeholder="placeholder"
			:disabled="disabled"
		/>
		<p v-if="description" class="input-description">
			{{ description }}
		</p>
		<p
			data-test="input-error-message"
			v-if="error.show"
			class="input-error-message"
		>
			{{ error.message }}
		</p>
	</label>
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
		description: {
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
		},
		keyUpEnter() {
			if (this.disabled) return;
			this.$emit("keyup-enter");
		}
	}
};
</script>
