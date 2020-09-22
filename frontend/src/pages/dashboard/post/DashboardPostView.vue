<template>
	<div class="view">
		<div class="viewpost">
			<div class="viewpost__vote">
				<div>
					<Vote
						:post-id="post.postId"
						:voters="voters"
						@update-voters="updateVoters"
					/>
				</div>
				<div class="viewpost__content">
					<h2 class="viewpost__title">
						{{ post.title }}
					</h2>
					<div class="viewpost__meta">
						<div class="viewpost__meta-author">
							<avatar class="viewpost__author-avatar" :name="username" />
							{{ username }}
						</div>
						<div class="viewpost__meta-divider">
							|
						</div>
						<div class="viewpost__meta-date">
							{{ post.createdAt | moment("MMMM DD, YYYY") }}
						</div>
					</div>
				</div>
			</div>
			<p v-html="post.contentMarkdown" />
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import Vote from "../../../components/post/Vote";
import Avatar from "../../../components/Avatar";

export default {
	name: "DashboardPostView",
	data() {
		return {
			post: {},
			voters: []
		};
	},
	components: {
		// components
		Vote,
		Avatar
	},
	computed: {
		username() {
			if (this.post.firstname) {
				return `${this.post.firstname}${
					this.post.lastname ? ` ${this.post.lastname}` : ""
				}`;
			}
			return this.post.username;
		},
		postAuthor() {
			const userId = this.$store.getters["user/getUserId"];
			return userId === this.post.userId;
		}
	},
	methods: {
		postBySlug() {
			const slug = this.$route.params.slug;

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${slug}`)
				.then(response => {
					this.post = response.data.post;
					this.voters = response.data.voters;
				})
				.catch(error => {
					const err = { ...error };

					if (err.response.data.error.code === "post_not_found") {
						this.$store.dispatch("alerts/add", {
							title: "Post not found",
							type: "error",
							timeout: 5000
						});

						this.$router.push("/");
					}
				});
		},
		updateVoters(voters) {
			this.voters = voters;
		}
	},
	created() {
		this.postBySlug();
	}
};
</script>
