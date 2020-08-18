<template>
	<div class="post">
		<div class="post__voters">
			<arrow-icon
				class="post__voters-arrow"
				:class="{ 'post__voters-vote': vote }"
			/>
			{{ voters }}
		</div>
		<div class="post__content">
			<router-link class="post__content-link" :to="`post/${slug}`">
				<h5 class="post__content-title">{{ title }}</h5>
			</router-link>
			<p class="post__content-description" v-html="sliceDescription" />
		</div>
	</div>
</template>

<script>
import ArrowIcon from "../../assets/images/icons/arrow";

export default {
	name: "post",
	components: {
		ArrowIcon
	},
	props: {
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			default: ""
		},
		slug: {
			type: String,
			required: true
		},
		voters: {
			type: Number,
			default: 0
		},
		vote: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		sliceDescription() {
			return (
				this.description.slice(0, 120) +
				(this.description.length > 120 ? "..." : "")
			);
		}
	}
};
</script>
