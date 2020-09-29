<template>
	<div class="view">
		<div v-if="isPostExist" class="viewpost">
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
							<avatar
								class="viewpost__author-avatar"
								:src="userAvatar"
								:name="fullname"
							/>
							{{ postAuthorName }}
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
		<p v-else>
			There is no such post.
		</p>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import Vote from "../../../components/post/Vote";
import Avatar from "../../../components/Avatar";

// mixins
import userAvatar from "../../../mixins/userAvatar";

export default {
	name: "DashboardPostView",
	data() {
		return {
			post: {},
			voters: [],
			isPostExist: true
		};
	},
	components: {
		// components
		Vote,
		Avatar
	},
	mixins: [userAvatar],
	computed: {
		postAuthorName() {
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
					if (error.response.data.code === "POST_NOT_FOUND") {
						this.isPostExist = false;
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
