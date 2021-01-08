<template>
	<div>
		<div class="form-section">
			<div class="form-columns">
				<div class="form-column">
					<l-text
						label="Name"
						placeholder="Enter board name"
						:value="name"
						@input="value => $emit('update-name', value)"
					/>

					<toggle-item
						label="View voters"
						@input="value => $emit('update-view-voters', value)"
						:checked="viewVoters"
						note="Show people who vote the post"
					/>

					<color-input
						:value="color"
						@input="value => $emit('update-color', value)"
					/>
				</div>

				<div class="form-column">
					<l-text
						label="Slug"
						placeholder="Board slug url"
						:value="url"
						@input="value => $emit('update-url', value)"
						:description="slimUrl"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// components
import LText from "../input/LText";
import ToggleItem from "../input/ToggleItem";
import ColorInput from "../ColorInput";

export default {
	name: "BoardForm",
	data() {
		return {
			error: {
				name: {
					show: false,
					message: ""
				},
				url: {
					show: false,
					message: ""
				},
				color: {
					show: false,
					message: ""
				}
			}
		};
	},
	props: {
		name: {
			type: String,
			default: "",
			required: true
		},
		url: {
			type: String,
			default: "",
			required: true
		},
		viewVoters: {
			type: Boolean,
			default: false
		},
		color: {
			type: String,
			default: "",
			required: true
		}
	},
	components: {
		LText,
		ToggleItem,
		ColorInput
	},
	computed: {
		slimUrl() {
			return this.url
				.replace(/[^\w]+/gi, "-")
				.trim()
				.toLowerCase();
		}
	}
};
</script>
