<template>
  <div v-if="isPostExist">
    <h4 class="post-edit-heading">Edit post</h4>
		<div v-if="!postLoading">
			<l-text
				v-model="post.title"
				label="Title"
				type="text"
				name="Post title"
				placeholder="Name of the feature"
				:error="postFieldError"
				:disabled="updatePostPermissionDisabled"
				@keyup-enter="savePost"
				@hide-error="hideTitleError"
			/>
			<l-textarea
				v-model="post.contentMarkdown"
				label="Description"
				name="Post description"
				placeholder="What would you use it for?"
				:disabled="updatePostPermissionDisabled"
			/>
			<div style="display: flex; justify-content: flex-start">
				<Button
					type="primary"
					:loading="postSubmitting"
					:disabled="updatePostPermissionDisabled"
					@click="savePost"
				>
					Update
				</Button>
			</div>
		</div>
		<div v-else class="loader-container">
      <loader />
    </div>
  </div>
  <p v-else>
    There is no such post.
  </p>
</template>

<script lang="ts">
export default {
	name: "PostEdit"
}
</script>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../../../router";
import { useSettingStore } from "../../../store/settings"
import { useUserStore } from "../../../store/user"
import { getPostBySlug, updatePost } from "../../../modules/posts";

// components
import { FormFieldErrorType } from "../../../components/ui/input/formBaseProps";
import Loader from "../../../components/ui/Loader.vue";
import LText from "../../../components/ui/input/LText.vue";
import LTextarea from "../../../components/ui/input/LTextarea.vue";
import Button from "../../../components/ui/Button.vue";

const { get: siteSettings } = useSettingStore()
const { permissions, getUserId } = useUserStore()

// posts
const post = reactive({
	postId: "",
	title: "",
	slug: "",
	slugId: "",
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
const postSubmitting = ref(false)
const postFieldError = reactive({
	show: false,
	message: ""
})

const updatePostPermissionDisabled = computed(() => {
	const checkPermission = permissions.includes("post:update");
	const authorId = post.author.userId;
	if (!checkPermission && getUserId !== authorId) return true;

	return false;
})

// TODO: Add TS types
function hideTitleError(event: FormFieldErrorType) {
	postFieldError.show = event.show;
	postFieldError.message = event.message;
};

async function getPost() {
	postLoading.value = true;

	const route = router.currentRoute.value;
	const slug = route.params.slug.toString();

	try {
		const response = await getPostBySlug(slug);

		post.title = response.data.post.title;
		post.contentMarkdown = response.data.post.contentMarkdown;
		post.postId = response.data.post.postId;
		post.slugId = response.data.post.slugId;
		post.author = response.data.post.author;
	} catch (error: any) {
		if (error.response.data.code === "POST_NOT_FOUND") {
			isPostExist.value = false;
		}
	} finally {
		postLoading.value = false;
	}
}

async function savePost() {
	if (!post.title) {
		postFieldError.show = true;
		postFieldError.message = "Please enter a valid post title";
		return;
	}

	postSubmitting.value = true;

	const postData = {
		id: post.postId,
		title: post.title,
		contentMarkdown: post.contentMarkdown,
		slugId: post.slugId,
		userId: post.author.userId
	};

	try {
		const response = await updatePost(postData);

		router.push(`/posts/${response.data.post.slug}`);
	} catch (error) {
		console.log(error);
	} finally {
		postSubmitting.value = false;
	}
}

onMounted(() => getPost());

useHead({
	title: "Edit post",
	meta: [
		{
			name: "og:title",
			content: () => `Edit post • ${siteSettings.title}`
		}
	]
})
</script>

<style lang='sass'>
.post-edit-heading
  margin-bottom: 2rem
</style>
