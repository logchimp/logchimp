<template>
	<div class="toggle-item">
		<div class="toggle-item-row">
			<label>{{ label }}</label>
			<toggle
				ref="toggleRefs"
				:checked="check"
				:disabled="disabled"
				@input="emit"
			/>
		</div>
		<p v-if="note" class="toggle-item-note">
			{{ note }}
		</p>
	</div>
</template>

<script>
// components
import Toggle from "./Toggle";

export default {
	name: "ToggleItem",
	data() {
		return {
			check: this.checked
		};
	},
	components: {
		Toggle
	},
	props: {
		label: {
			type: String,
			required: true
		},
		checked: {
			type: Boolean,
			default: false
		},
		note: {
			type: String,
			default: ""
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	watch: {
		checked: function(newValue) {
			this.check = newValue;
		}
	},
	methods: {
		emit(event) {
			if (this.disabled) return;
			this.check = event;
			this.$emit("input", event);
		}
	}
};
</script>
