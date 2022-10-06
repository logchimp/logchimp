<template>
  <div v-if="!postLoading">
    <div v-if="isPostExist" class="viewpost">
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
            <div class="viewpost__meta-divider">
              |
            </div>
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
                <dropdown
                  v-if="dropdown.active"
                  class="viewpost__menu-dropdown"
                >
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
            v-model="commentInput"
            name="comment"
            placeholder="Leave a comment"
            @keyup-enter="submitComment"
          />

          <div style="display: flex; justify-content: flex-end;">
            <Button
              type="primary"
              :loading="submittingComment"
              :disabled="!commentInput"
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
import { router } from "../../../router";
import { useSettingStore } from "../../../store/settings"
import { useUserStore } from "../../../store/user"
import { getPostBySlug, addComment, postActivity } from "../../../modules/posts";

// components
import Loader from "../../../components/Loader.vue";
import Vote, { VoteEventType } from "../../../components/post/Vote.vue";
import DropdownWrapper from "../../../components/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../components/dropdown/Dropdown.vue";
import DropdownItem from "../../../components/dropdown/DropdownItem.vue";
import Avatar from "../../../components/Avatar";
import LText from "../../../components/input/LText.vue";
import Button from "../../../components/Button.vue";
import ActivityItem from "../../../components/ActivityItem/ActivityItem.vue";

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
const postLoading = ref(false)
const isPostExist = ref(true)

// comments
const commentInput = ref("");
const submittingComment = ref(false);

// activity
const activity = reactive<{
	loading: boolean
	sort: string
	// TODO: Add TS types
	data: any
}>({
	loading: false,
	sort: "desc",
	data: []
})

const postAuthorName = computed(() => {
	return post.author.name
		? post.author.name
		: post.author.username;
})

const postAuthor = computed(() => {
	const checkPermission = permissions.includes("post:update");
	const authorId = post.author.userId;

	if (!checkPermission && getUserId !== authorId) return false;
	return true;
});

const showPostActivity = computed(() => {
	return labs.comments;
})

async function getPostActivity(sort = "desc") {
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
	const slug = route.params.slug;

	try {
		const response = await getPostBySlug(slug);

		Object.assign(post, response.data.post);
		getPostActivity();
	} catch (error: any) {
		if (error.response.data.code === "POST_NOT_FOUND") {
			isPostExist.value = false;
		}
	} finally {
		postLoading.value = false;
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
	title: `${post.title} · Post`,
	meta: [
		{
			name: "description",
			content: `${post.contentMarkdown}`
		},

		// openGraph
		{
			name: "og:title",
			content: `${post.title} · Post · ${siteSettings.title}`
		},
		{
			name: "og:description",
			content: `${post.contentMarkdown}`
		}
	]
});
</script>
