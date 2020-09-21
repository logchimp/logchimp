<template>
	<div
		class="alert-item"
		:style="{
			animationDuration: timeout / 1000 + 's'
		}"
	>
		<div
			class="alert-item-type"
			:class="{
				'alert-type-error': type === 'error',
				'alert-type-success': type === 'success',
				'alert-type-warning': type === 'warning'
			}"
		></div>
		<div class="alert-item-content">
			<div class="alert-item-icon">
				<Success
					class="alert-icon alert-icon-success"
					v-if="type === 'success'"
				/>
				<Warning
					class="alert-icon alert-icon-warning"
					v-if="type === 'warning'"
				/>
				<Error class="alert-icon alert-icon-error" v-if="type === 'error'" />
			</div>
			<div class="alert-item-title">
				{{ title }}
			</div>
		</div>
	</div>
</template>

<script>
import Success from "./icons/Success";
import Warning from "./icons/Warning";
import Error from "./icons/Error";

export default {
	name: "Alert",
	components: {
		Success,
		Warning,
		Error
	},
	props: {
		title: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true
		},
		timeout: {
			type: Number,
			required: true,
			default: 2000
		}
	},
	mounted() {
		setTimeout(() => this.$emit("remove"), this.timeout);
	}
};
</script>
