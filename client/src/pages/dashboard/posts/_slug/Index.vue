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
          {{ title }}
        </h5>
      </div>

      <Button
        type="primary"
        :loading="loading.updatePostButton"
        :disabled="updatePostPermissionDisabled"
        @click="updatePost"
      >
        Save
      </Button>
    </header>

    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="post.title"
            label="Title"
            placeholder="Name of the feature"
          />

          <l-textarea
            v-model="post.contentMarkdown"
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
              <post v-if="!loading.post" :post="post" />
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

<script>
// modules
import { getPostBySlug, updatePost } from "../../../../modules/posts";
import { searchBoard } from "../../../../modules/boards";
import { searchRoadmap } from "../../../../modules/roadmaps";

// components
import Button from "../../../../components/Button";
import LText from "../../../../components/input/LText";
import LTextarea from "../../../../components/input/LTextarea";
import Post from "../../../../components/post/Post";
import Dropdown from "../../../../components/dropdown/Dropdown";
import DropdownWrapper from "../../../../components/dropdown/DropdownWrapper";
import BoardSuggestion from "../../../../components/board/BoardSuggestion";

export default {
  name: "DashboardPostView",
  components: {
    // components
    Button,
    LText,
    LTextarea,
    Post,
    Dropdown,
    DropdownWrapper,
    BoardSuggestion
  },
  data() {
    return {
      title: "",
      loading: {
        post: false,
        updatePostButton: false
      },
      post: {},
      boards: {
        search: "",
        suggestions: []
      },
      roadmaps: {
        search: "",
        suggestions: []
      }
    };
  },
  computed: {
    updatePostPermissionDisabled() {
      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("post:update");
      return !checkPermission;
    }
  },
  created() {
    this.postBySlug();
  },
  methods: {
    async updatePost() {
      this.loading.updatePostButton = true;
      try {
        const postData = {
          id: this.post.postId,
          title: this.post.title,
          contentMarkdown: this.post.contentMarkdown,
          slugId: this.post.slugId,
          userId: this.post.author.userId,
          boardId: this.post.board ? this.post.board.boardId : null,
          roadmapId: this.post.roadmap ? this.post.roadmap.id : null
        };

        const response = await updatePost(postData);
        if (response.status === 200) {
          this.$router.push("/dashboard/posts");
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.loading.updatePostButton = false;
      }
    },
    async postBySlug() {
      this.loading.post = true;
      const slug = this.$route.params.slug;

      try {
        const response = await getPostBySlug(slug);

        this.title = response.data.post.title;
        this.post = response.data.post;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading.post = false;
      }
    },
    async suggestBoard(name) {
      if (!name) {
        return this.clearSuggestion("boards");
      }

      try {
        const response = await searchBoard(name);
        this.boards.suggestions = response.data.boards;
      } catch (err) {
        console.error(err);
      }
    },
    async suggestRoadmap(name) {
      if (!name) {
        return this.clearSuggestion("roadmaps");
      }

      try {
        const response = await searchRoadmap(name);
        this.roadmaps.suggestions = response.data.roadmaps;
      } catch (err) {
        console.error(err);
      }
    },
    selectBoard(index) {
      const item = this.boards.suggestions[index];
      this.post.board = item;
      this.clearSuggestion("boards");
    },
    selectRoadmap(index) {
      const item = this.roadmaps.suggestions[index];
      this.post.roadmap = item;
      this.clearSuggestion("roadmaps");
    },
    clearSuggestion(type) {
      this[type].search = "";
      this[type].suggestions = [];
    }
  },
  metaInfo() {
    return {
      title: `${this.title} · Post · Dashboard`
    };
  }
};
</script>
