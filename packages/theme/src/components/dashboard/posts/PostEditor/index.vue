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
      :loading="saveBtnLoading"
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
              <post-item v-if="!saveBtnLoading" :post="post" />
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
          <SearchBoardDropdown
            :board="post.board"
            @selected="selectBoard"
          />
        </div>

        <div class="form-column">
          <SearchRoadmapDropdown
            :roadmap="post.roadmap"
            @selected="selectRoadmap" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from "vue";
import type { IDashboardPost } from "@logchimp/types";

// modules
import { router } from "../../../../router";
import { updatePost } from "../../../../modules/posts";
import { useUserStore } from "../../../../store/user";
import { useDashboardPosts } from "../../../../store/dashboard/posts";

// components
import Button from "../../../../components/ui/Button.vue";
import LText from "../../../../components/ui/input/LText.vue";
import LTextarea from "../../../../components/ui/input/LTextarea.vue";
import PostItem from "../../../../components/post/PostItem.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import BreadcrumbDivider from "../../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import SearchRoadmapDropdown from "../../../../ee/components/dashboard/roadmap/SearchRoadmapDropdown/Dropdown.vue";
import SearchBoardDropdown from "../../../../ee/components/dashboard/boards/SearchBoardDropdown/Dropdown.vue";
import type { TCurrentBoard } from "../../../../ee/components/dashboard/boards/SearchBoardDropdown/search";
import type { TCurrentRoadmap } from "../../../../ee/components/dashboard/roadmap/SearchRoadmapDropdown/search";

const { permissions } = useUserStore();
const dashboardPosts = useDashboardPosts();

interface Props {
  post: IDashboardPost;
}

const props = defineProps<Props>();

const saveBtnLoading = ref(false);
const post = reactive<IDashboardPost>({
  ...props.post,
});

const updatePostPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("post:update");
  return !checkPermission;
});

async function updatePostHandler() {
  saveBtnLoading.value = true;

  try {
    const response = await updatePost({
      id: post.postId,
      title: post.title,
      contentMarkdown: post.contentMarkdown,
      slugId: post.slugId,
      userId: post.author.userId,
      boardId: post.board ? post.board.boardId : null,
      roadmapId: post.roadmap ? post.roadmap.id : null,
    });

    Object.assign(post, response.data.post);
    dashboardPosts.updatePost(post);
    router.push("/dashboard/posts");
  } catch (err) {
    console.error(err);
  } finally {
    saveBtnLoading.value = false;
  }
}

function selectBoard(board: TCurrentBoard) {
  Object.assign(post, {
    board,
  });
}

function selectRoadmap(roadmap: TCurrentRoadmap) {
  Object.assign(post, {
    roadmap,
  });
}

defineOptions({
  name: "DashboardPostEditor",
});
</script>
