<template>
	<div class="viewpost">
		<div class="viewpost__vote">
			<div>
				<vote
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
					<div class="viewpost__meta-divider">|</div>
					<time
						:datetime="post.createdAt"
						:title="$dayjs(post.createdAt).format('dddd, DD MMMM YYYY hh:mm')"
						class="post-date"
					>
						{{ $dayjs(post.createdAt).from() }}
					</time>
					<dropdown-wrapper v-if="postAuthor" class="viewpost__menu">
						<template #toggle>
							<div class="dropdown-menu-icon">
								<more-icon />
							</div>
						</template>
						<template #default="dropdown">
							<dropdown v-if="dropdown.active" class="viewpost__menu-dropdown">
								<dropdown-item @click="editPost">
									<template #icon>
										<edit-icon />
									</template>
									Edit
								</dropdown-item>
							</dropdown>
						</template>
					</dropdown-wrapper>
				</div>
			</div>
		</div>

		<p v-html="post.contentMarkdown" />

		<div v-if="showPostActivity" class="activity-section">
			<div class="card">
				<l-text
					v-model="comment.value"
					name="comment"
					placeholder="Leave a comment"
					@keyup-enter="submitComment"
				/>

				<div style="display: flex; justify-content: flex-end">
					<Button
						type="primary"
						:loading="comment.buttonLoading"
						:disabled="!comment.value"
						@click="submitComment"
					>
						Submit
					</Button>
				</div>
			</div>

			<header class="activity-header">
				<h6>activity</h6>

				<!-- <div class="activity-sort">
            <div
              class="sort-option"
              :class="{
                'sort-option-active': activity.sort === 'desc'
              }"
              @click="activity.sort = 'desc'"
            >
              Newest
            </div>
            <div
              class="sort-option"
              :class="{
                'sort-option-active': activity.sort === 'asc'
              }"
              @click="activity.sort = 'asc'"
            >
              Oldest
            </div>
          </div> -->
			</header>

			<div v-if="!activity.loading" class="activity-list">
				<activity-item
					v-for="item in activity.data"
					:key="item.id"
					:activity="item"
				/>
			</div>
			<div v-else class="loader-container">
				<loader />
			</div>
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import { MoreHorizontal as MoreIcon, Edit2 as EditIcon } from "lucide-vue";

// components
import Loader from "../../../components/ui/Loader.vue";
import Vote from "../../../components/vote/Vote.vue";
import DropdownWrapper from "../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../components/ui/dropdown/DropdownItem.vue";
import Avatar from "../../../components/ui/Avatar.vue";
import LText from "../../../components/ui/LText.vue";
import Button from "../../../components/ui/Button.vue";
import ActivityItem from "../../../components/activity/ActivityItem.vue";

export default {
	name: "PostView",
	layout: "viewer",
	components: {
		// components
		Loader,
		Vote,
		DropdownWrapper,
		Dropdown,
		DropdownItem,
		Avatar,
		LText,
		Button,
		ActivityItem,

		// icons
		MoreIcon,
		EditIcon
	},
	data() {
		return {
			comment: {
				value: "",
				buttonLoading: false
			},
			activity: {
				loading: false,
				sort: "desc",
				data: []
			}
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		postAuthorName() {
			return this.post.author.name
				? this.post.author.name
				: this.post.author.username;
		},
		postAuthor() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("post:update");
			const userId = this.$store.getters["user/getUserId"];
			const authorId = this.post.author.userId;

			if (!checkPermission && userId !== authorId) return false;
			return true;
		},
		showPostActivity() {
			return this.$store.getters["settings/labs"].comments;
		},
	},
	watch: {
		// Get post activity on changing sort
		"activity.sort": {
			handler(value) {
				this.getPostActivity(value);
			}
		}
	},
	async asyncData({ route, $axios, error, store }) {
		const userId = store.getters["user/getUserId"];
		const slug = route.params.slug;

		try {
			const response = await $axios({
				method: "POST",
				url: "/api/v1/posts/slug",
				data: {
					slug,
					userId
				}
			});

			return {
				post: response.data.post
			};
		} catch (err) {
			error({
				code: err.response.data.code,
				...(err.response.data.code === "POST_NOT_FOUND" && {
					notFound: err.response.data.code === "POST_NOT_FOUND"
				})
			});
		}
	},
	created() {
		// Fetch post activity on client-side
		this.getPostActivity();
	},
	methods: {
		async getPostActivity(sort = "desc") {
			this.activity.loading = true;

			try {
				const postId = this.post.postId;
				const response = await this.$axios({
					method: "GET",
					url: `/api/v1/posts/${postId}/activity`,
					params: {
						sort
					}
				});

				this.activity.data = response.data.activity;
				this.activity.loading = false;
			} catch (error) {
				console.log(error);
				this.activity.loading = false;
			}
		},
		async submitComment() {
			if (!this.comment.value) return;

			try {
				const token = this.$store.getters["user/getAuthToken"];
				const postId = this.post.postId;

				const response = await this.$axios({
					method: "POST",
					url: `/api/v1/posts/${postId}/comments`,
					data: {
						body: this.comment.value,
						is_internal: false
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.comment.value = "";
				this.activity.data.unshift(response.data.comment);
			} catch (error) {
				console.log(error);
			}
		},
		updateVoters(voters) {
			this.post.voters.votesCount = voters.votesCount;
			this.post.voters.viewerVote = voters.viewerVote;
		},
		editPost() {
			this.$router.push(`/posts/${this.post.slug}/edit`);
		}
	},
	head() {
		return {
			title: `${this.post.title} • Post • ${this.settings.title}`,
			meta: [
				{
					name: "description",
					content: `${this.post.contentMarkdown}`
				},

				// openGraph
				{
					name: "og:title",
					content: `${this.post.title} • Post • ${this.settings.title}`
				},
				{
					name: "og:description",
					content: `${this.post.contentMarkdown}`
				}
			]
		};
	}
};
</script>

<style lang='sass'>
.view
	display: flex
	flex-direction: column

@media (min-width: 960px)
	.view
		flex-direction: row

// content
.viewpost
	flex: 2

	&__vote
		display: flex

	&__title
		margin-bottom: 0.75rem

	&__content
		width: 100%

	&__meta
		display: flex
		margin-bottom: 1.5rem
		align-items: center

		&-author
			display: flex
			align-items: center

		&-divider
			margin-left: 0.875rem
			margin-right: 0.875rem
			color: #BABABA

		&-date
			color: #CCCCCC

	&__author-avatar
		margin-right: 0.5rem

	&__menu
		margin-left: auto

		&-dropdown
			right: 0

@media (min-width: 960px)
	.viewpost
		margin-right: 1.5rem

// voters
.viewvoters
	flex: 1

	&__container
		padding: 1.5rem
		background-color: #F5F5F5

	&__users
		margin-bottom: 1.5rem

		&-heading
			color: #A1A1A1
			margin-bottom: 0.625rem

		&-voters
			display: flex

		&-image
			margin-right: -0.625rem
			max-width: 2.25rem
			border-radius: 1rem
			border: 1px solid var(--color-white)

@media (max-width: 960px)
	.viewvoters
		margin-top: 2rem

@media (min-width: 960px)
	.viewvoters
		margin-left: 1.5rem

// Post activity
.activity-section, .activity-header
	margin-top: 2rem

.activity-header
	display: flex
	align-items: center
	margin-bottom: 1.25rem
	text-transform: uppercase
	font-size: 0.875rem

	h6
		margin-bottom: 0
		font-weight: 600

	.activity-sort
		display: flex
		align-items: center
		margin-left: auto

		.sort-option
			margin-left: 0.875rem
			cursor: pointer

		.sort-option-active
			text-decoration: underline
</style>
