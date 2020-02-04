<template>
	<div class="modal">
		<div
			class="modal__card"
			:style="{
				width: `${modelSize}px`
			}"
		>
			<div class="modal__card-header">
				<slot name="header" />
			</div>
			<div class="modal__card-body">
				<slot />
			</div>
			<div class="modal__card-footer">
				<slot name="footer" />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "LModal",
	props: {
		size: {
			type: String,
			required: true
		}
	},
	computed: {
		modelSize() {
			switch (this.size) {
				case "small":
				default:
					return "450";
			}
		}
	}
};
</script>
