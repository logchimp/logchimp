<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem to="/dashboard/boards">
          Boards
        </BreadcrumbItem>

        <template v-if="title">
          <BreadcrumbDivider />
          <BreadcrumbItem>
            {{ title }}
          </BreadcrumbItem>
        </template>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="saveButtonLoading"
      :disabled="createBoardPermissionDisabled"
      @click="update"
    >
      Save
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="board.name"
            label="Name"
            placeholder="Enter board name"
          />

          <color-input v-model="board.color" />
        </div>

        <div class="form-column flex">
          <l-text
            v-model="slugUrl"
            label="Slug"
            placeholder="Board slug url"
            :error="{
              show: urlAvailableError,
              message: 'Not available'
            }"
            @keydown="validateBoardUrl"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">Privacy</h6>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="board.display"
            label="Display on site"
            note="Show this board on the site"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="board.view_voters"
            label="View voters"
            note="Show people who vote the post"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import { watchDebounced } from "@vueuse/core";

// modules
import { router } from "../../../../router";
import {
  getBoardByUrl,
  updateBoard,
  checkBoardSlug,
} from "../../../modules/boards";
import { useUserStore } from "../../../../store/user";
import { useDashboardBoards } from "../../../store/dashboard/boards";

// components
import Button from "../../../../components/ui/Button.vue";
import LText from "../../../../components/ui/input/LText.vue";
import ToggleItem from "../../../../components/ui/input/ToggleItem.vue";
import ColorInput from "../../../../components/ui/ColorInput.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import BreadcrumbDivider from "../../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";

const title = ref("");
const boardSlugUrl = ref("");

const board = reactive({
  boardId: "",
  name: "",
  url: "",
  color: "",
  view_voters: false,
  display: false,
});
const urlAvailableError = ref(false);
const saveButtonLoading = ref(false);

const { permissions } = useUserStore();
const dashboardBoards = useDashboardBoards();

const createBoardPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("board:update");
  return !checkPermission;
});

const slugUrl = computed({
  get() {
    return board.url;
  },
  set(value) {
    board.url = value
      .trim()
      .replace(/[^\w]+/gi, "-")
      .toLowerCase();
  },
});

watchDebounced(
  slugUrl,
  async () => {
    if (boardSlugUrl.value === slugUrl.value) return;

    urlAvailableError.value = false;

    try {
      const response = await checkBoardSlug(board.url);
      if (!response.data.available) {
        urlAvailableError.value = true;
      }
    } catch (err) {
      console.error(err);
    }
  },
  { debounce: 600 },
);

async function validateBoardUrl(event: KeyboardEvent) {
  const key = event.key;

  // only accept letters, numbers, & numpad numbers
  if (
    !/^[a-zA-Z0-9_]$/.test(key) &&
    key !== "Backspace" &&
    key !== "ArrowLeft" &&
    key !== "ArrowRight"
  ) {
    event.preventDefault();
  }
}

async function update() {
  saveButtonLoading.value = true;
  try {
    const response = await updateBoard({
      boardId: board.boardId,
      color: board.color,
      name: board.name,
      url: board.url,
      view_voters: board.view_voters,
      display: board.display,
    });

    dashboardBoards.updateBoard(response.data.board);
    router.push("/dashboard/boards");
  } catch (error) {
    console.error(error);
  } finally {
    saveButtonLoading.value = false;
  }
}

async function getBoard() {
  const route = router.currentRoute.value;

  try {
    const url = route.params.url.toString();
    const response = await getBoardByUrl(url);

    Object.assign(board, response.data.board);
    boardSlugUrl.value = board.url;
    title.value = response.data.board.name;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => getBoard());

useHead({
  title: () => `${title.value ? `${title.value} • ` : ""}Board • Dashboard`,
});

defineOptions({
  name: "BoardSettings",
});
</script>
