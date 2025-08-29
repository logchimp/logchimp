<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Posts</BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <DialogRoot v-model:open="showCreatePostModal">
      <DialogTrigger as-child>
        <Button
          type="primary"
          :disabled="createPostPermissionDisabled"
        >
          Create Post
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent class="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white p-6 shadow-lg duration-200 rounded-lg">
          <div class="flex flex-col space-y-1.5">
            <DialogTitle class="text-lg font-semibold leading-none tracking-tight">
              Create New Post
            </DialogTitle>
            <DialogDescription class="text-sm text-gray-600">
              Select a board and create your post
            </DialogDescription>
          </div>

          <div class="space-y-4">
            <!-- Board Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Board
              </label>
              <div v-if="loadingBoards" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading boards...
              </div>
              <select
                v-else
                v-model="selectedBoardId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Choose a board</option>
                <option
                  v-for="board in availableBoards"
                  :key="board.boardId"
                  :value="board.boardId"
                >
                  {{ board.name }}
                </option>
              </select>
            </div>

            <!-- Create Post Form -->
            <div v-if="selectedBoardId">
              <create-post
                :board-id="selectedBoardId"
                :dashboard="true"
                :modal-mode="true"
                @post-created="handlePostCreated"
              />
            </div>
          </div>

          <DialogClose as-child>
            <button class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              <span class="sr-only">Close</span>
              ×
            </button>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </DashboardPageHeader>

	<div class="px-3 lg:px-6">
    <post-item
      v-for="post in posts"
      :key="post.postId"
      :post="post"
      :dashboard="true"
    />

    <infinite-scroll @infinite="getBoardPosts" :state="state" />
	</div>
</template>

<script lang="ts">
export default {
  name: "DashboardPosts",
};
</script>

<script setup lang="ts">
// packages
import { ref, onMounted, computed, watch } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { getPosts } from "../../../modules/posts";
import { getPublicBoards } from "../../../ee/modules/boards";

// store
import { useUserStore } from "../../../store/user";

// components
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import InfiniteScroll, { type InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue"
import PostItem from "../../../components/post/PostItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import Button from "../../../components/ui/Button.vue";
import CreatePost from "../../../components/post/CreatePost.vue";

// Reka UI Components
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "reka-ui";

const { permissions } = useUserStore();

// Posts state
const posts = ref<unknown>([])
const page = ref<number>(1);
const state = ref<InfiniteScrollStateType>()

// Create post modal state
const showCreatePostModal = ref<boolean>(false);
const selectedBoardId = ref<string>("");
const availableBoards = ref<any[]>([]);
const loadingBoards = ref<boolean>(false);

const createPostPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("post:create");
  return !checkPermission;
});

async function getBoardPosts() {
  state.value = "LOADING"

	try {
		const response = await getPosts({
			page: page.value,
			sort: "DESC"
		});

		if (response.data.posts.length) {
			// For initial load (page 1), replace the array. For subsequent loads, append.
			if (page.value === 1) {
				posts.value = response.data.posts;
			} else {
				posts.value.push(...response.data.posts);
			}
			page.value += 1;
			state.value = "LOADED"
		} else {
			state.value = "COMPLETED"
		}
	} catch (error) {
		console.error(error);
		state.value = "ERROR"
	}
}

async function loadAvailableBoards() {
  loadingBoards.value = true;
  try {
    const response = await getPublicBoards({
      page: 1,
      limit: 50,
      sort: "ASC"
    });

    if (response.data && response.data.boards) {
      availableBoards.value = response.data.boards;
    } else {
      availableBoards.value = [];
    }
  } catch (error) {
    console.error("Failed to load boards:", error);
    availableBoards.value = [];
  } finally {
    loadingBoards.value = false;
  }
}

function handlePostCreated() {
  // Close the modal
  showCreatePostModal.value = false;
  selectedBoardId.value = "";
  
  // Reset for fresh load
  posts.value = [];
  page.value = 1;
  state.value = "LOADING";
  
  // This will trigger getBoardPosts which now handles both initial and subsequent loads
}

// Load boards when modal opens
watch(showCreatePostModal, (isOpen) => {
  if (isOpen && availableBoards.value.length === 0) {
    loadAvailableBoards();
  }
});

onMounted(() => {
  // Infinite scroll will handle initial load automatically
});

useHead({
	title: "Posts • Dashboard"
})
</script>
