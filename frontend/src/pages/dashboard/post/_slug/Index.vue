<template>
	<div class="view">
		<div v-if="!post.loading">
			<div v-if="isPostExist" class="viewpost">
				<div class="viewpost__vote">
					<div>
						<Vote
							:post-id="post.postId"
							:votes-count="post.voters.votesCount"
							:is-voted="post.voters.viewerVote"
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
									:src="post.author.avatar"
									:name="post.author.name"
								/>
								{{ postAuthorName }}
							</div>
							<div class="viewpost__meta-divider">
								|
							</div>
							<time
								:datetime="post.createdAt"
								:title="post.createdAt | moment('dddd, DD MMMM YYYY hh:mm:ss')"
								class="post-date"
							>
								{{ post.createdAt | moment("from") }}
							</time>
						</div>
					</div>
				</div>
				<p v-html="post.contentMarkdown" />
			</div>
			<p v-else>
				There is no such post.
			</p>
		</div>
		<div v-else class="loader-container">
			<loader />
		</div>
	</div>
</template>

<script>
// modules
import { getPostBySlug } from "../../../../modules/posts";

// components
import Loader from "../../../../components/Loader";
import Vote from "../../../../components/post/Vote";
import Avatar from "../../../../components/Avatar";

export default {
	name: "DashboardPostView",
	components: {
		// components
		Loader,
		Vote,
		Avatar
	},
	data() {
		return {
			post: {
				loading: false
			},
			isPostExist: true
		};
	},
	computed: {
		postAuthorName() {
			return this.post.author.name
				? this.post.author.name
				: this.post.author.username;
		},
		postAuthor() {
			const userId = this.$store.getters["user/getUserId"];
			return userId === this.post.userId;
		},
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	created() {
		this.postBySlug();
	},
	methods: {
		async postBySlug() {
			this.post.loading = true;
			const slug = this.$route.params.slug;

			try {
				const response = await getPostBySlug(slug);

				this.post = response.data.post;
			} catch (error) {
				if (error.response.data.code === "POST_NOT_FOUND") {
					this.isPostExist = false;
				}
			} finally {
				this.post.loading = false;
			}
		},
		updateVoters(voters) {
			this.post.voters.votesCount = voters.votesCount;
			this.post.voters.viewerVote = voters.viewerVote;
		}
	},
	metaInfo() {
		return {
			title: `${this.post.title} · Post · Dashboard`,
			meta: [
				{
					name: "og:title",
					content: `${this.post.title} · Post · Dashboard · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
