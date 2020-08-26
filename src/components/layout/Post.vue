<template>
	<div class="post">
		<div class="post__voters">
			<arrow-icon
				class="post__voters-arrow"
				:class="{ 'post__voters-vote': isVoted }"
			/>
			{{ voteCount }}
		</div>
		<div class="post__content">
			<router-link class="post__content-link" :to="`post/${post.slug}`">
				<h5 class="post__content-title">{{ post.title }}</h5>
			</router-link>
			<p class="post__content-description" v-html="sliceContentMarkdown" />
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
		post: {
			type: Object,
			required: true,
			default: () => {}
		}
	},
	computed: {
		voteCount() {
			return this.post.voters.length;
		},
		sliceContentMarkdown() {
			if (this.post.contentMarkdown) {
				return (
					this.post.contentMarkdown.slice(0, 120) +
					(this.post.contentMarkdown.length > 120 ? "..." : "")
				);
			} else {
				return "";
			}
		},
		isVoted() {
			const userId = this.$store.getters["user/getUserId"];
			return this.post.voters.find(item => {
				return item.userId === userId;
			});
		}
	},
		}
	}
};
</script>
