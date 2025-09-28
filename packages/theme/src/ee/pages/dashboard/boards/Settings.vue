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
          <SlugInputField
            :current-value="board.url"
            @update="(value) => (boardSlug = value)"
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
import { computed, onMounted, reactive, ref, defineAsyncComponent } from "vue";
import { useHead } from "@vueuse/head";
import type { IBoardUpdateRequestBody } from "@logchimp/types";

// modules
import { router } from "../../../../router";
import { getBoardByUrl, updateBoard } from "../../../modules/boards";
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
const SlugInputField = defineAsyncComponent(
  () =>
    import(
      "../../../components/dashboard/boards/BoardSettingsForm/SlugInputField.vue"
    ),
);

const board = reactive<IBoardUpdateRequestBody>({
  boardId: "",
  name: "",
  url: "",
  color: "",
  view_voters: false,
  display: false,
});
const boardSlug = ref("");
const saveButtonLoading = ref(false);

const { permissions } = useUserStore();
const dashboardBoards = useDashboardBoards();

const updateBoardPermissionDisabled = computed(() => {
  return !permissions.includes("board:update");
});

async function update() {
  saveButtonLoading.value = true;
  try {
    const body = {
      boardId: board.boardId,
      color: board.color,
      name: board.name,
      url: board.url,
      view_voters: board.view_voters,
      display: board.display,
    };
    if (boardSlug.value) {
      body.url = boardSlug.value;
    }
    const response = await updateBoard(body);

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
