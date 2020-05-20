<template>
	<div @click.native="toggleVote" class="vote__count">
		<arrow-icon class="vote__count-arrow" />
		<div class="vote__count-number">
			{{ voteCount }}
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

// icons
import ArrowIcon from "../../../assets/images/icons/arrow";

export default {
	name: "voteCount",
	components: {
		ArrowIcon
	},
	props: {
		voteCount: {
			type: Number,
			default: 0
		}
	},
	methods: {
		// add vote to post
		upvote() {
			const memberId = localStorage.getItem("memberId");
			const token = localStorage.getItem("authToken");

			axios({
				method: "post",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/vote/upvote`,
				data: {
					postId: this.postId,
					memberId
				},
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
				.then(response => {
					console.log("response");
					console.log(response);
				})
				.catch(error => {
					console.log(error);
				});
		},
		// remove vote to post
		removeVote() {
			// remove upvote of the currenct member
		},
		toggleVote() {
			if (this.memberVote) {
				this.removeVote();
			} else {
				this.upvote();
			}
		}
	}
};
</script>
