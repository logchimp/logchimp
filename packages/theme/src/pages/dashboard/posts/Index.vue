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
      <PhCrownSimple
        :size="20"
        weight="regular"
        class="fill-white"
      />
    </Button>
  </DashboardPageHeader>

	<div class="px-3 lg:px-6">
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
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";
import { PhCrownSimple } from "@phosphor-icons/vue";

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
    router.push(`/dashboard/posts/${url}`);
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
