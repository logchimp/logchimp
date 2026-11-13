<template>
  <DashboardPageHeader>
    <template #left>
      <Breadcrumbs>
        <BreadcrumbItem>Posts</BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :disabled="createPostPermissionDisabled"
      :loading="createPostButtonLoading"
      @click="createPostHandler"
    >
      Create Post
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <license-validation-failed
      v-if="displayLicenseValidationFailed"
      resource-type="posts"
    />
    <template v-else>
      <l-text
        v-model="dashboardPosts.searchQuery"
        label="Search posts"
        placeholder="Search posts by title"
      />

      <post-item
        v-for="post in dashboardPosts.posts"
        :key="post.postId"
        :post="post"
        :dashboard="true"
      />

      <infinite-scroll
        :immediate-check="dashboardPosts.posts.length === 0"
        :on-infinite="dashboardPosts.fetchPosts"
        :state="dashboardPosts.state"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useHead } from "@unhead/vue";
import type { AxiosError } from "axios";
import type { components } from "@logchimp/api-ts-types";

// modules
import { useDashboardPosts } from "../../../store/dashboard/posts";
import { router } from "../../../router";
import { useUserStore } from "../../../store/user";
import { PostsAPI } from "../../../modules/posts";
import { useAlertStore } from "../../../store/alert.ts";

// components
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import InfiniteScroll from "../../../components/ui/InfiniteScroll.vue";
import PostItem from "../../../components/post/PostItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import Button from "../../../components/ui/Button.vue";
import LicenseValidationFailed from "../../../components/LicenseValidationFailed.vue";
import LText from "../../../components/ui/input/LText.vue";

const { add: toast } = useAlertStore();
const { permissions } = useUserStore();
const dashboardPosts = useDashboardPosts();
const postsAPI = new PostsAPI();

const createPostButtonLoading = ref(false);
const displayLicenseValidationFailed = computed(
  () =>
    dashboardPosts.error === "LICENSE_VALIDATION_FAILED" ||
    dashboardPosts.error === "LICENSE_INSUFFICIENT_TIER",
);

const postTemplate = {
  postId: "",
  title: "",
  slug: "",
  slugId: "",
  contentMarkdown: "",
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  author: {
    userId: "",
    name: "",
    username: "",
    avatar: "",
  },
  board: {
    boardId: "",
    name: "",
    url: "",
    color: "",
    createdAt: new Date().toISOString(),
  },
  roadmap: {
    id: "",
    name: "",
    url: "",
    color: "",
  },
  voters: {
    votes: [],
    votesCount: 0,
    viewerVote: undefined,
  },
};

const createPostPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("post:create");
  return !checkPermission;
});

async function createPostHandler() {
  createPostButtonLoading.value = true;

  try {
    const response = await postsAPI.CreatePost({
      title: "new post",
    });
    Object.assign(postTemplate, response.post);
    dashboardPosts.appendPost(postTemplate);

    const url = response.post.slug;
    router.push(`/dashboard/posts/${encodeURIComponent(url)}`);
  } catch (error) {
    const err = error as AxiosError<
      components["schemas"]["GenericAPIErrorResponseBody"]
    >;

    toast({
      title: err.response?.data.message ?? "Failed to create post",
      type: "error",
    });
  } finally {
    createPostButtonLoading.value = false;
  }
}

useHead({
  title: "Posts • Dashboard",
});

defineOptions({
  name: "DashboardPosts",
});
</script>
