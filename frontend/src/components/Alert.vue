<template>
	<div
		class="alert__item"
		:style="{
			animationDuration: timeout / 1000 + 's'
		}"
	>
		<div
			class="alert__item-type"
			:class="{
				'alert__type-error': type === 'error',
				'alert__type-success': type === 'success',
				'alert__type-warning': type === 'warning'
			}"
		></div>
		<div class="alert__item-content">
			<div class="alert__item-icon">
				<Success
					class="alert__icon alert__icon-success"
					v-if="type === 'success'"
				/>
				<Warning
					class="alert__icon alert__icon-warning"
					v-if="type === 'warning'"
				/>
				<Error class="alert__icon alert__icon-error" v-if="type === 'error'" />
			</div>
			<div>
				<div class="alert__item-title">
					{{ title }}
				</div>
				<div v-if="description" class="alert__item-description">
					{{ description }}
				</div>
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
		description: {
			type: String,
			required: true,
			default: ""
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
