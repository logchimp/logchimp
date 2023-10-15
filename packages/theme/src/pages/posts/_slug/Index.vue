<template>
	<div v-if="!postLoading">
		<div v-if="isPostExist" class="viewpost">
			<div class="viewpost__vote">
				<div>
					<vote
						:post-id="post.postId"
						:votes-count="post.voters.votesCount"
						:is-voted="isVoted"
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
								:name="postAuthorName"
							/>
							{{ postAuthorName }}
						</div>
						<div class="viewpost__meta-divider">|</div>
						<time
							:datetime="post.createdAt"
							:title="dayjs(post.createdAt).format('dddd, DD MMMM YYYY hh:mm')"
							class="post-date"
						>
							{{ dayjs(post.createdAt).fromNow() }}
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

			<p v-html="postContent" />

			<div v-if="showPostActivity" class="activity-section">
				<add-comment @add-comment="addComment" :post-id="post.postId" />

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
		<p v-else>
			There is no such post.
		</p>
	</div>
	<div v-else class="loader-container">
		<loader />
	</div>
</template>

<script lang="ts">
export default {
	name: "PostView"
}
</script>

<script setup lang="ts">
// packages
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useHead } from "@vueuse/head";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { MoreHorizontal as MoreIcon, Edit2 as EditIcon } from "lucide-vue";

// modules
import type { ApiSortType } from "../../../types";
import { router } from "../../../router";
import { useSettingStore } from "../../../store/settings"
import { useUserStore } from "../../../store/user"
import { getPostBySlug, addComment, postActivity } from "../../../modules/posts";

// components
import Loader from "../../../components/ui/Loader.vue";
import Vote, { VoteEventType } from "../../../components/vote/Vote.vue";
import DropdownWrapper from "../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../components/ui/dropdown/DropdownItem.vue";
import { Avatar } from "../../../components/ui/Avatar";
import AddComment from "../../../components/activity/AddComment.vue"
import ActivityItem from "../../../components/activity/ActivityItem.vue";

const { permissions, getUserId } = useUserStore()
const { labs, get: siteSettings } = useSettingStore()

dayjs.extend(relativeTime);

// posts
const post = reactive({
	postId: "",
	title: "",
	slug: "",
	contentMarkdown: "",
	createdAt: "",
	author: {
		name: "",
		username: "",
		avatar: "",
		userId: ""
	},
	voters: {
		votesCount: 0,
		viewerVote: false,
	}
});
const postContent = ref<string>('');
const postLoading = ref(false)
const isPostExist = ref(false)

// comments
const commentInput = ref("");
const submittingComment = ref(false);

// activity
const activity = reactive<{
	loading: boolean
	sort: ApiSortType
	// TODO: Add TS types
	data: any
}>({
	loading: false,
	sort: "DESC",
	data: []
})

const isVoted = computed(() => post.voters.hasOwnProperty('viewerVote'));

const postAuthorName = computed(() => post.author.name || post.author.username)

const postAuthor = computed(() => {
	const checkPermission = permissions.includes("post:update");
	const authorId = post.author.userId;

	if (!checkPermission && getUserId !== authorId) return false;
	return true;
});

const showPostActivity = computed(() => {
	return labs.comments;
})

async function getPostActivity(sort: ApiSortType = "DESC") {
	activity.loading = true;

	try {
		const response = await postActivity({
			post_id: post.postId,
			sort
		});

		activity.data = response.data.activity;
	} catch (error) {
		console.log(error);
	} finally {
		activity.loading = false;
	}
}

// Get post activity on changing sort
watch(() => activity.sort, (value) => {
	getPostActivity(value)
})

async function postBySlug() {
	postLoading.value = true;
	const route = router.currentRoute.value

	if (route.params.slug) {
		try {
			const slug = route.params.slug.toString();
			const response = await getPostBySlug(slug);

      postLoading.value = false;
			Object.assign(post, response.data.post);
      isPostExist.value = true;

      if (response.data.post.hasOwnProperty('contentMarkdown')) {
        postContent.value = response.data.post.contentMarkdown.replace(/\n/g, '<br>');
      }

			getPostActivity();
		} catch (error: any) {
			if (error.response.data.code === "POST_NOT_FOUND") {
        postLoading.value = false;
        isPostExist.value = false;
			}
		}
	}
}

async function submitComment() {
	if (!commentInput.value) return;

	try {
		const response = await addComment({
			post_id: post.postId,
			body: commentInput.value,
			is_internal: false
		});

		commentInput.value = "";
		activity.data.unshift(response.data.comment);
	} catch (error) {
		console.log(error);
	}
}

function updateVoters(voters: VoteEventType) {
	post.voters.votesCount = voters.votesCount;
	post.voters.viewerVote = voters.viewerVote;
}

function editPost() {
	router.push(`/posts/${post.slug}/edit`);
}

onMounted(() => postBySlug())

useHead({
	title: () => `${post.title ? `${post.title} • ` : ''}Post`,
	meta: [
		{
			name: "description",
			content: () => post.contentMarkdown,
		},

		// openGraph
		{
			name: "og:title",
			content: () => `${post.title ? `${post.title} • ` : ''}Post • ${siteSettings.title}`
		},
		{
			name: "og:description",
			content: () => post.contentMarkdown,
		}
	]
});
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
