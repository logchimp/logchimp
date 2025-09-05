<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem to="/dashboard/posts">
          Posts
        </BreadcrumbItem>

        <!-- Show divider & title once data loaded -->
        <template v-if="post.title">
          <BreadcrumbDivider />
          <BreadcrumbItem>
            {{ post.title }}
          </BreadcrumbItem>
        </template>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="loading.updatePostButton"
      :disabled="updatePostPermissionDisabled"
      @click="updatePostHandler"
    >
      Save
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="post.title"
            label="Title"
            placeholder="Name of the feature"
          />

          <l-textarea
            :model-value="post.contentMarkdown ?? undefined"
            @update:model-value="(value) => post.contentMarkdown = value ?? null"
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
              <post-item v-if="!loading.post" :post="post" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">
        Other
      </h6>
      <div class="form-columns">
        <div class="form-column">
          <BoardSearchSuggestions @select="selectBoard" />
        </div>

        <div class="form-column">
          <Dropdown @select="selectRoadmap" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { useHead } from "@vueuse/head";
import type {
  IBoardPrivate,
  IDashboardPost,
  IRoadmapPrivate,
} from "@logchimp/types";

// modules
import { router } from "../../../../router";
import { getPostBySlug, updatePost } from "../../../../modules/posts";
import { useUserStore } from "../../../../store/user";

// components
import Button from "../../../../components/ui/Button.vue";
import LText from "../../../../components/ui/input/LText.vue";
import LTextarea from "../../../../components/ui/input/LTextarea.vue";
import PostItem from "../../../../components/post/PostItem.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import BreadcrumbDivider from "../../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import Dropdown from "../../../../ee/components/dashboard/roadmap/SearchRoadmapDropdown/Dropdown.vue";
import BoardSearchSuggestions from "../../../../ee/components/dashboard/boards/BoardSearchSuggestions.vue";

const { permissions } = useUserStore();

const loading = reactive<{
  post: boolean;
  updatePostButton: boolean;
}>({
  post: false,
  updatePostButton: false,
});
const post = reactive<IDashboardPost>({
  postId: "",
  title: "",
  slug: "",
  slugId: "",
  contentMarkdown: "",
  // TODO: what should be the default/empty value
  updatedAt: new Date(),
  // TODO: what should be the default/empty value
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
});

const updatePostPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("post:update");
  return !checkPermission;
});

async function updatePostHandler() {
  loading.updatePostButton = true;

  try {
    const response = await updatePost({
      id: post.postId,
      title: post.title,
      contentMarkdown: post.contentMarkdown,
      slugId: post.slugId,
      userId: post.author.userId,
      boardId: post.board ? post.board.boardId : undefined,
      roadmapId: post.roadmap ? post.roadmap.id : undefined,
    });

    if (response.status === 200) {
      router.push("/dashboard/posts");
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.updatePostButton = false;
  }
}

async function postBySlug() {
  loading.post = true;
  const route = router.currentRoute.value;

  if (route.params.slug) {
    try {
      const slug = route.params.slug.toString();
      const response = await getPostBySlug(slug);

      Object.assign(post, response.data.post);
      loading.post = false;
    } catch (err) {
      console.error(err);
      loading.post = false;
    }
  }
}

function selectBoard(board: IBoardPrivate) {
  Object.assign(post, {
    board,
  });
}

function selectRoadmap(roadmap: IRoadmapPrivate) {
  Object.assign(post, {
    roadmap,
  });
}

onMounted(() => postBySlug());

useHead({
  title: () => `${post.title ? `${post.title} • ` : ""}Post • Dashboard`,
});

defineOptions({
  name: "DashboardPostView",
});
</script>
