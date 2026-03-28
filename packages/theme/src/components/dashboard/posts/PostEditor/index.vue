<template>
  <div class="form-section">
    <div class="form-columns">
      <div class="form-column">
        <l-text
          v-model="post.title"
          label="Title"
          placeholder="Name of the feature"
          :error="postFieldError"
          @hide-error="hideTitleError"
          class="!mb-1"
        />

        <HelperText :isError="post.title.length > MAX_TITLE_LENGTH">
          {{ MAX_TITLE_LENGTH - post.title.length }} characters
        </HelperText>

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
        <div class="flex items-center justify-between gap-2">
          <InputLabel html-for="" class="mb-0">
            Board
          </InputLabel>
          <UpgradeTooltip v-if="!hasValidLicense" :has-valid-license="hasValidLicense">
            <LicenseCrown color="neutral" />
          </UpgradeTooltip>
        </div>
        <SearchBoardDropdown
          :board="post.board"
          @selected="selectBoard"
        />
      </div>

      <div class="form-column">
        <div class="flex items-center justify-between gap-2">
          <InputLabel html-for="" class="mb-0">
            Roadmap
          </InputLabel>
          <UpgradeTooltip v-if="!hasValidLicense" :has-valid-license="hasValidLicense">
            <LicenseCrown color="neutral" />
          </UpgradeTooltip>
        </div>
        <SearchRoadmapDropdown
          :roadmap="post.roadmap"
          @selected="selectRoadmap" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { IDashboardPost } from "@logchimp/types";
import { storeToRefs } from "pinia";

// modules
import { router } from "../../../../router";
import { updatePost } from "../../../../modules/posts";
import { useDashboardPosts } from "../../../../store/dashboard/posts";
import { useSettingsEEStore } from "../../../../ee/store/settings";

// components
import HelperText from "../../../../components/ui/input/HelperText.vue";
import LText from "../../../../components/ui/input/LText.vue";
import LTextarea from "../../../../components/ui/input/LTextarea.vue";
import PostItem from "../../../../components/post/PostItem.vue";
import SearchRoadmapDropdown from "../../../../ee/components/dashboard/roadmap/SearchRoadmapDropdown/Dropdown.vue";
import SearchBoardDropdown from "../../../../ee/components/dashboard/boards/SearchBoardDropdown/Dropdown.vue";
import type { TCurrentBoard } from "../../../../ee/components/dashboard/boards/SearchBoardDropdown/search";
import type { TCurrentRoadmap } from "../../../../ee/components/dashboard/roadmap/SearchRoadmapDropdown/search";
import type { FormFieldErrorType } from "../../../ui/input/formBaseProps";
import { MAX_TITLE_LENGTH } from "../../../../constants";
import InputLabel from "../../../ui/input/InputLabel.vue";
import LicenseCrown from "../../../../ee/components/icons/LicenseCrown.vue";
import UpgradeTooltip from "../../../../ee/components/UpgradeTooltip.vue";

const dashboardPosts = useDashboardPosts();
const settingsEEStore = useSettingsEEStore();
const { hasValidLicense } = storeToRefs(settingsEEStore);

interface Props {
  post: IDashboardPost;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "loading", value: boolean): void;
}>();

const saveBtnLoading = ref(false);
const post = reactive<IDashboardPost>({
  ...props.post,
});

const postFieldError = reactive({
  show: false,
  message: "",
});

function hideTitleError(event: FormFieldErrorType) {
  postFieldError.show = event.show;
  postFieldError.message = event.message;
}

async function updatePostHandler() {
  if (!post.title.trim() || post.title.length > MAX_TITLE_LENGTH) {
    postFieldError.show = true;
    postFieldError.message = "Please enter a valid post title";
    return;
  }

  setLoading(true);

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
    setLoading(false);
  }
}

function setLoading(value: boolean) {
  saveBtnLoading.value = value;
  emit("loading", value);
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

onMounted(() => {
  settingsEEStore.getLicenseInfo();
});

defineOptions({
  name: "DashboardPostEditor",
});
defineExpose({
  updatePostHandler,
});
</script>
