<template>
  <DashboardPageHeader>
    <template v-slot:left>
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
    <div
      v-if="dashboardPosts.error === 'LICENSE_VALIDATION_FAILED'"
      class="border border-dashed border-red-300/80 rounded-lg p-4 text-center flex flex-col items-center gap-y-2.5"
    >
      <KeyIcon class="stroke-red-600" />
      <p class="mb-1 font-medium">License issue</p>
      <span
        class="text-neutral-600 text-sm"
      >
        We are unable to display posts due to a license validation failure.
      </span>
    </div>
    <template v-else>
      <post-item
        v-for="post in dashboardPosts.posts"
        :key="post.postId"
        :post="post"
        :dashboard="true"
      />

      <infinite-scroll
        :on-infinite="dashboardPosts.fetchPosts"
        :state="dashboardPosts.state"
      />
    </template>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";
import { KeyIcon } from "lucide-vue";

// modules
import { useDashboardPosts } from "../../../store/dashboard/posts";
import { router } from "../../../router";
import { useUserStore } from "../../../store/user";
import { createPost } from "../../../modules/posts";

// components
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import InfiniteScroll from "../../../components/ui/InfiniteScroll.vue";
import PostItem from "../../../components/post/PostItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import Button from "../../../components/ui/Button.vue";

const { permissions } = useUserStore();
const dashboardPosts = useDashboardPosts();
const errorCode = ref<string | null>(null);
const createPostButtonLoading = ref(false);

const postTemplate = {
  postId: "",
  title: "",
  slug: "",
  slugId: "",
  contentMarkdown: "",
  updatedAt: new Date(),
  createdAt: new Date(),
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
    createdAt: new Date(),
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
    const response = await createPost({});
    Object.assign(postTemplate, response.data.post);
    dashboardPosts.appendPost(postTemplate);

    const url = response.data.post.slug;
    router.push(`/dashboard/posts/${encodeURIComponent(url)}`);
  } catch (err) {
    console.error(err);
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
