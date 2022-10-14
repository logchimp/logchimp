<template>
  <div>
    <header class="form-header">
      <div class="breadcrumbs">
        <router-link to="/dashboard/posts" class="breadcrum-item">
          Posts
        </router-link>
        <div class="breadcrum-divider">
          /
        </div>
        <h5 class="breadcrum-item">
          {{ postData.title }}
        </h5>
      </div>

      <Button
        type="primary"
        :loading="loading.updatePostButton"
        :disabled="updatePostPermissionDisabled"
        @click="updatePostHandler"
      >
        Save
      </Button>
    </header>

    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="postData.title"
            label="Title"
            placeholder="Name of the feature"
          />

          <l-textarea
            v-model="postData.contentMarkdown"
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
              <post v-if="!loading.post" :post="postData" />
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

<script lang="ts">
export default {
	name: "DashboardPostView",
}
</script>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../../../../router"

import { PostType, getPostBySlug, updatePost } from "../../../../modules/posts";
import { Board, searchBoard } from "../../../../modules/boards";
import { Roadmap, searchRoadmap } from "../../../../modules/roadmaps";
import { UserType } from "../../../../modules/users";
import { PostVoteType } from "../../../../modules/votes";

import { useUserStore } from "../../../../store/user";

// components
import Button from "../../../../components/Button.vue";
import LText from "../../../../components/input/LText.vue";
import LTextarea from "../../../../components/input/LTextarea.vue";
import Post from "../../../../components/post/Post.vue";
import Dropdown from "../../../../components/dropdown/Dropdown.vue";
import DropdownWrapper from "../../../../components/dropdown/DropdownWrapper.vue";
import BoardSuggestion from "../../../../components/board/BoardSuggestion.vue";

interface GetPostType extends PostType {
  author: UserType
  board: Board
  roadmap: Roadmap
  voters: {
    votes: PostVoteType[]
    votesCount: number
    viewerVote: boolean
  }
}

const { permissions } = useUserStore()

const loading = reactive<{
	post: boolean
	updatePostButton: boolean
}>({
	post: false,
	updatePostButton: false
})
const postData = reactive<GetPostType>({
	postId: "",
	title: "",
	slug: "",
	slugId: "",
	contentMarkdown: "",
	createdAt: "",
	updatedAt: "",
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
    viewerVote: false,
  }
})
const boards = reactive<{
	search: string
	suggestions: Board[]
}>({
	search: "",
	suggestions: []
})
const roadmaps = reactive<{
	search: string
	suggestions: Roadmap[]
}>({
	search: "",
	suggestions: []
})

const updatePostPermissionDisabled = computed(() =>  {
	const checkPermission = permissions.includes("post:update");
	return !checkPermission;
})

async function updatePostHandler() {
	loading.updatePostButton = true;

	try {
		const response = await updatePost({
			id: postData.postId,
			title: postData.title,
			contentMarkdown: postData.contentMarkdown,
			slugId: postData.slugId,
			userId: postData.author.userId,
			boardId: postData.board ? postData.board.boardId : undefined,
			roadmapId: postData.roadmap ? postData.roadmap.id : undefined
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

      Object.assign(postData, response.data.post);
      loading.post = false;
    } catch (err) {
      console.error(err);
      loading.post = false;
    }
  }
}

async function suggestBoard(event: any) {
  const name = event.target.value;
	if (!name) {
		boards.search = "";
		boards.suggestions = []
		return;
	}

	try {
		const response = await searchBoard(name);
		boards.suggestions = response.data.boards;
	} catch (err) {
		console.error(err);
	}
}

async function suggestRoadmap(event: any) {
  const name = event.target.value;
	if (!name) {
		roadmaps.search = "";
		roadmaps.suggestions = []
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

  Object.assign(postData.board, item)
	boards.search = "";
	boards.suggestions = []
}

function selectRoadmap(index: number) {
	const item = roadmaps.suggestions[index];

  Object.assign(postData.roadmap, item)
	roadmaps.search = "";
	roadmaps.suggestions = []
}

onMounted(() => postBySlug())

useHead({
	title: `${postData.title ? `${postData.title} • `: ''}Post • Dashboard`
})
</script>
