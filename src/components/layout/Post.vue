<template>
	<div class="post">
		<Vote
			:post-id="post.postId"
			:voters="post.voters"
		/>
		<div class="post__content">
			<router-link class="post__content-link" :to="`post/${post.slug}`">
				<h5 class="post__content-title">{{ post.title }}</h5>
			</router-link>
			<p class="post__content-description" v-html="sliceContentMarkdown" />
		</div>
	</div>
</template>

<script>
// components
import Vote from "../Vote";

export default {
	name: "post",
	props: {
		post: {
			type: Object,
			required: true,
			default: () => {}
		}
	},
	components: {
		Vote
	},
	computed: {
		sliceContentMarkdown() {
			if (this.post.contentMarkdown) {
				return (
					this.post.contentMarkdown.slice(0, 120) +
					(this.post.contentMarkdown.length > 120 ? "..." : "")
				);
			} else {
				return "";
			}
		}
	},
	methods: {
		}
	}
};
</script>
