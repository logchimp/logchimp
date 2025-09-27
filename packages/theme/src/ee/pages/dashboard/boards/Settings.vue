<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem to="/dashboard/boards">
          Boards
        </BreadcrumbItem>

        <template v-if="board?.name">
          <BreadcrumbDivider />
          <BreadcrumbItem>
            {{ board.name }}
          </BreadcrumbItem>
        </template>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="saveButtonLoading"
      :disabled="updateBoardPermissionDisabled"
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

        <div class="form-column">
          <div class="grid gap-y-1.5">
            <l-text
              v-model="boardSlug.value"
              label="Slug"
              placeholder="Board slug url"
              class="!mb-0"
              @keydown="validateBoardUrl"
            />
            <HelperText>
              Alphabets, numbers or underscore are allowed.
            </HelperText>
            <HelperText
              :class="[
                'flex items-center gap-x-1 font-medium transition-opacity',
                boardSlug.value !== board.url ? 'opacity-100' : 'opacity-0'
              ]"
              aria-hidden="true"
            >
              <template v-if="boardSlug.available">
                <CheckCircle aria-hidden="true" class="size-4 stroke-green-600" />
                Available
              </template>
              <template v-else-if="boardSlug.available === false">
                <CheckCircle aria-hidden="true" class="size-4 stroke-red-500" />
                Not available
              </template>
            </HelperText>
          </div>
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
import { CheckCircle2 as CheckCircle } from "lucide-vue";

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
import HelperText from "../../../../components/ui/input/HelperText.vue";
import ToggleItem from "../../../../components/ui/input/ToggleItem.vue";
import ColorInput from "../../../../components/ui/ColorInput.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import BreadcrumbDivider from "../../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";

const board = reactive({
  boardId: "",
  name: "",
  url: "",
  color: "",
  view_voters: false,
  display: false,
});
const boardSlug = reactive<{
  value: string;
  available: boolean | undefined;
}>({
  value: "",
  available: undefined,
});
const saveButtonLoading = ref(false);

const { permissions } = useUserStore();
const dashboardBoards = useDashboardBoards();

const updateBoardPermissionDisabled = computed(() => {
  return !permissions.includes("board:update");
});

watchDebounced(
  () => boardSlug.value,
  async (newValue) => {
    const current = board.url;
    if (!current) {
      boardSlug.value = "";
      boardSlug.available = undefined;
      return;
    }

    if (newValue === current) return;
    boardSlug.available = undefined;

    try {
      const response = await checkBoardSlug(newValue);
      boardSlug.available = response.data.available;
    } catch (err) {
      console.error(err);
    }
  },
  { debounce: 600 },
);

async function validateBoardUrl(event: KeyboardEvent) {
  const key = event.key;

  // allow common shortcuts (copy/paste/select all, etc.)
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  // allow letters, numbers, underscore, and hyphen; plus navigation/edit keys
  const allowed =
    /^[a-zA-Z0-9_-]$/.test(key) ||
    [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ].includes(key);

  if (!allowed) {
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
    boardSlug.value = board.url;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => getBoard());

useHead({
  title: () => `${board.name ? `${board.name} • ` : ""}Board • Dashboard`,
});

defineOptions({
  name: "BoardSettings",
});
</script>
