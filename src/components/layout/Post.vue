<template>
	<div class="post">
		<div class="post__vote-count">
			<vote-count :vote-count="voteCount" />
		</div>
		<div class="post__content">
			<router-link class="post__content-link" :to="`post/${slug}`">
				<h3 class="post__content-title">{{ title }}</h3>
			</router-link>
			<p class="post__content-bodyMarkdown" v-html="bodyMarkdown" />
		</div>
	</div>
</template>

<script>
// components
import VoteCount from "../ui/post/VoteCount";

export default {
	name: "post",
	components: {
		VoteCount
	},
	props: {
		title: {
			type: String,
			required: true
		},
		bodyMarkdown: {
			type: String,
			default: ""
		},
		slug: {
			type: String,
			required: true
		},
		voteCount: {
			type: Number,
			default: 0
		},
		vote: {
			type: Boolean,
			default: false
		}
	}
};
</script>
