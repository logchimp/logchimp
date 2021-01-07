<template>
	<div class="input">
		<label class="input-field-label" for="accent-color">Color</label>
		<div class="color-input">
			<div
				class="color-preview"
				:class="{
					'input-error': error.show
				}"
				:style="{
					backgroundColor: `#${value}`
				}"
			/>
			<input
				:value="value"
				class="input-field"
				:class="{
					'input-error': error.show
				}"
				type="text"
				@input="$emit('input', $event.target.value)"
				@click="hideError"
				placeholder="abcdef"
				spellcheck="false"
			/>
		</div>
		<p v-if="error.show" class="input-error-message">{{ error.message }}</p>
	</div>
</template>

<script>
export default {
	name: "ColorInput",
	data() {
		return {
			error: {
				show: false,
				message: "The color should be in valid hex format."
			}
		};
	},
	props: {
		value: {
			type: String,
			default: ""
		}
	},
	watch: {
		value: function(newValue) {
			const validColor = /^[0-9A-F]{6}$/i.test(newValue);
			if (!validColor) this.error.show = true;
			else this.error.show = false;
		}
	},
	methods: {
		hideError() {
			this.error.show = false;
		}
	}
};
</script>
