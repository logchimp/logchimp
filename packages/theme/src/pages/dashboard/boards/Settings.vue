<template>
  <div>
    <header class="form-header">
      <breadcrumbs>
        <router-link to="/dashboard/boards" class="breadcrum-item">
          Boards
        </router-link>

        <!-- Show divider & title once data loaded -->
        <template v-if="title">
          <div class="breadcrum-divider">
            /
          </div>
          <h5 class="breadcrum-item">
            {{ title }}
          </h5>
        </template>
      </breadcrumbs>

      <Button
        type="primary"
        :loading="saveButtonLoading"
        :disabled="createBoardPermissionDisabled"
        @click="update"
      >
        Save
      </Button>
    </header>

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
          <l-text
            v-model="slimUrl"
            label="Slug"
            placeholder="Board slug url"
            :error="{
              show: urlAvailableError,
              message: 'Not available'
            }"
            @keyup="validateBoardUrl"
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

<script lang="ts">
export default {
	name: "BoardSettings",
}
</script>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../../../router";
import {
  getBoardByUrl,
  updateBoard,
  checkBoardName
} from "../../../modules/boards";
import { useUserStore } from "../../../store/user";

// components
import Button from "../../../components/ui/Button.vue";
import LText from "../../../components/ui/input/LText.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import ColorInput from "../../../components/ui/ColorInput.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";

const title = ref("")
const board = reactive({
	boardId: "",
	name: "",
	url: "",
	color: "",
	view_voters: false,
	display: false
})
const urlAvailableError = ref(false)
const saveButtonLoading = ref(false)

const { permissions } = useUserStore()

const createBoardPermissionDisabled = computed(() => {
	const checkPermission = permissions.includes("board:update");
	return !checkPermission;
});

const slimUrl = computed({
	get() {
		return board.url;
	},
	set(value) {
		board.url = value
			.trim()
			.replace(/[^\w]+/gi, "-")
			.toLowerCase();
	}
})

async function validateBoardUrl(event: any) {
	const keyCode = event.keyCode;

	// only accept letters, numbers, & numpad numbers
	if (
		!(
			(keyCode > 65 && keyCode < 90) ||
			(keyCode > 45 && keyCode < 57) ||
			(keyCode > 96 && keyCode < 105) ||
			keyCode === 8
		)
	)
		return false;

	urlAvailableError.value = false;

	try {
		const response = await checkBoardName(board.url);
		if (!response.data.available) {
			urlAvailableError.value = true;
		}
	} catch (err) {
		console.error(err);
	}
}

async function update() {
	saveButtonLoading.value = true;
	try {
		await updateBoard({
			boardId: board.boardId,
			color: board.color,
			name: board.name,
			url: board.url,
			view_voters: board.view_voters,
			display: board.display
		});

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

    Object.assign(board, response.data.board)
    title.value = response.data.board.name;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => getBoard());

useHead({
	title: () => `${title.value ? `${title.value} • ` : ''}Board • Dashboard`
});
</script>
