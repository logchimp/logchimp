<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<router-link to="/dashboard/posts" class="breadcrum-item">
					Posts
				</router-link>
				<div class="breadcrum-divider">
					/
				</div>
				<h5 class="breadcrum-item">
					{{ title }}
				</h5>
			</div>

			<Button
				type="primary"
				:loading="loading.updatePostButton"
				:disabled="updatePostPermissionDisabled"
				@click="updatePost"
			>
				Save
			</Button>
		</header>

		<div class="form-section">
			<div class="form-columns">
				<div class="form-column">
					<l-text
						v-model="post.title"
						label="Title"
						placeholder="Name of the feature"
					/>

					<l-textarea
						v-model="post.contentMarkdown"
						label="Description"
						rows="4"
						placeholder="What would you use it for?"
					/>
				</div>

				<div class="form-column">
					<div>
						<p class="input-field-label">
							Preview
						</p>
						<div class="card">
							<post v-if="!loading.post" :post="post" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { getPostBySlug } from "../../../../modules/posts";

// components
import Button from "../../../../components/Button";
import LText from "../../../../components/input/LText";
import LTextarea from "../../../../components/input/LTextarea";
import Post from "../../../../components/post/Post";

export default {
	name: "DashboardPostView",
	components: {
		// components
		Button,
		LText,
		LTextarea,
		Post
	},
	data() {
		return {
			title: "",
			loading: {
				post: false,
				updatePostButton: false
			},
			post: {}
		};
	},
	computed: {
		updatePostPermissionDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("post:update");
			return !checkPermission;
		},
		postAuthorName() {
			return this.post.author.name
				? this.post.author.name
				: this.post.author.username;
		},
		postAuthor() {
			const userId = this.$store.getters["user/getUserId"];
			return userId === this.post.userId;
		}
	},
	created() {
		this.postBySlug();
	},
	methods: {
		async updatePost() {},
		async postBySlug() {
			this.loading.post = true;
			const slug = this.$route.params.slug;

			try {
				const response = await getPostBySlug(slug);

				this.title = response.data.post.title;
				this.post = response.data.post;
			} catch (err) {
				console.error(err);
			} finally {
				this.loading.post = false;
			}
		},
		updateVoters(voters) {
			this.post.voters.votesCount = voters.votesCount;
			this.post.voters.viewerVote = voters.viewerVote;
		}
	},
	metaInfo() {
		return {
			title: `${this.title} · Post · Dashboard`
		};
	}
};
</script>
