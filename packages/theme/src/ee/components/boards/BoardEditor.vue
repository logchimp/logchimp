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
            :error="boardFieldError"
            @hide-error="hideNameError"
          />

          <color-input v-model="board.color" />
        </div>

        <div class="form-column">
          <SlugInputField
            :current-value="board.url"
            @update="(value: string) => (boardSlug = value)"
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
import { computed, reactive, ref, defineAsyncComponent } from "vue";
import type { IBoardPrivate } from "@logchimp/types";

// modules
import { router } from "../../../router";
import { updateBoard } from "../../modules/boards";
import { useUserStore } from "../../../store/user";
import { useDashboardBoards } from "../../store/dashboard/boards";

// components
import type { FormFieldErrorType } from "../../../components/ui/input/formBaseProps";
import Button from "../../../components/ui/Button.vue";
import LText from "../../../components/ui/input/LText.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import ColorInput from "../../../components/ui/ColorInput.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import BreadcrumbDivider from "../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";
const SlugInputField = defineAsyncComponent(
  () =>
    import(
      "../../../ee/components/dashboard/boards/BoardSettingsForm/SlugInputField.vue"
    ),
);

interface Props {
  title: string;
  board: IBoardPrivate;
}
const props = defineProps<Props>();

const boardSlug = ref("");
const saveButtonLoading = ref(false);
const board = reactive<IBoardPrivate>({
  ...props.board,
});

const { permissions } = useUserStore();
const dashboardBoards = useDashboardBoards();

const updateBoardPermissionDisabled = computed(() => {
  return !permissions.includes("board:update");
});

const boardFieldError = reactive({
  show: false,
  message: "",
});

function hideNameError(event: FormFieldErrorType) {
  boardFieldError.show = event.show;
  boardFieldError.message = event.message;
}

async function update() {
  if (!board.name.trim()) {
    boardFieldError.show = true;
    boardFieldError.message = "Please enter a valid board name";
    return;
  }

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

defineOptions({
  name: "DashboardBoardEditor",
});
</script>
