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
          <dropdown-wrapper>
            <template #toggle>
              <l-text
                v-model="boards.search"
                label="Board"
                placeholder="Search board"
                @input="suggestBoard"
              />
            </template>

            <template #default="dropdown">
              <dropdown
                v-if="dropdown.active && boards.suggestions.length"
                :height="300"
              >
                <board-suggestion
                  v-for="(item, index) in boards.suggestions"
                  :key="item.boardId"
                  :board="item"
                  @click="selectBoard(index)"
                />
              </dropdown>
            </template>
          </dropdown-wrapper>
        </div>

        <div class="form-column">
          <dropdown-wrapper>
            <template #toggle>
              <l-text
                v-model="roadmaps.search"
                label="Roadmap"
                placeholder="Search roadmap"
                @input="suggestRoadmap"
              />
            </template>

            <template #default="dropdown">
              <dropdown
                v-if="dropdown.active && roadmaps.suggestions.length"
                :height="300"
              >
                <board-suggestion
                  v-for="(item, index) in roadmaps.suggestions"
                  :key="item.id"
                  :board="item"
                  @click="selectRoadmap(index)"
                />
              </dropdown>
            </template>
          </dropdown-wrapper>
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
import { searchBoard } from "../../../../ee/modules/boards";
import { searchRoadmap } from "../../../../modules/roadmaps";

import { useUserStore } from "../../../../store/user";

// components
import Button from "../../../../components/ui/Button.vue";
import LText from "../../../../components/ui/input/LText.vue";
import LTextarea from "../../../../components/ui/input/LTextarea.vue";
import PostItem from "../../../../components/post/PostItem.vue";
import Dropdown from "../../../../components/ui/dropdown/Dropdown.vue";
import DropdownWrapper from "../../../../components/ui/dropdown/DropdownWrapper.vue";
import BoardSuggestion from "../../../../components/board/BoardSuggestion.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import BreadcrumbDivider from "../../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";

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
const boards = reactive<{
  search: string;
  suggestions: IBoardPrivate[];
}>({
  search: "",
  suggestions: [],
});
const roadmaps = reactive<{
  search: string;
  suggestions: IRoadmapPrivate[];
}>({
  search: "",
  suggestions: [],
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

async function suggestBoard(event: Event) {
  const target = event.target as HTMLInputElement;
  const name = target.value;
  if (!name) {
    boards.search = "";
    boards.suggestions = [];
    return;
  }

  try {
    const response = await searchBoard(name);
    boards.suggestions = response.data.boards;
  } catch (err) {
    console.error(err);
  }
}

async function suggestRoadmap(event: Event) {
  const target = event.target as HTMLInputElement;
  const name = target.value;
  if (!name) {
    roadmaps.search = "";
    roadmaps.suggestions = [];
    return;
  }

  try {
    const response = await searchRoadmap(name);
    roadmaps.suggestions = response.data.roadmaps;
  } catch (err) {
    console.error(err);
  }
}

function selectBoard(index: number) {
  const item = boards.suggestions[index];

  Object.assign(post.board, item);
  boards.search = "";
  boards.suggestions = [];
}

function selectRoadmap(index: number) {
  const item = roadmaps.suggestions[index];

  Object.assign(post, {
    roadmap: item,
  });
  roadmaps.search = "";
  roadmaps.suggestions = [];
}

onMounted(() => postBySlug());

useHead({
  title: () => `${post.title ? `${post.title} • ` : ""}Post • Dashboard`,
});

defineOptions({
  name: "DashboardPostView",
});
</script>
