<template>
  <div v-if="!board.loading">
    <div v-if="isBoardExist">
      <div class="homepage">
        <main class="homepage-posts">
          <tab>
            <tab-item
              :class="{
                'tab-item-active': tab === 'latest'
              }"
              @click="updateTab('latest')"
            >
              <template #icon>
                <sort-desc-icon />
              </template>
              Latest
            </tab-item>
            <tab-item
              :class="{
                'tab-item-active': tab === 'oldest'
              }"
              @click="updateTab('oldest')"
            >
              <template #icon>
                <sort-asc-icon />
              </template>
              Oldest
            </tab-item>
          </tab>

          <component :is="activeTab" :board="board" />
        </main>
        <aside class="homepage-sidebar">
          <create-post v-if="isUserLoggedIn" :board-id="board.boardId" />
          <login-card v-else />
        </aside>
      </div>
    </div>
    <p v-else>
      There is no such board.
    </p>
  </div>
  <div v-else class="loader-container">
    <loader />
  </div>
</template>

<script>
// packages
import { SortAsc as SortAscIcon, SortDesc as SortDescIcon } from "lucide-vue";
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getBoardByUrl } from "../../modules/boards";

// components
import Loader from "../../components/Loader";
import Tab from "../../components/tab/Tab";
import TabItem from "../../components/tab/TabItem";
import LatestPosts from "../../components/post/LatestPosts";
import OldestPosts from "../../components/post/OldestPosts";
import CreatePost from "../../components/post/CreatePost";
import LoginCard from "../../components/LoginCard";

export default {
  name: "Board",
  components: {
    // packages
    InfiniteLoading,

    // components
    Loader,
    Tab,
    TabItem,
    LatestPosts,
    OldestPosts,
    CreatePost,
    LoginCard,

    // icons
    SortDescIcon,
    SortAscIcon
  },
  data() {
    return {
      tab: "latest",
      board: {
        loading: false
      },
      isBoardExist: true
    };
  },
  computed: {
    activeTab() {
      switch (this.tab) {
      case "oldest":
        return OldestPosts;
      case "latest":
      default:
        return LatestPosts;
      }
    },
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    },
    isUserLoggedIn() {
      const user = this.$store.getters["user/getUserId"];
      return !!user;
    }
  },
  created() {
    this.getBoard();
  },
  methods: {
    updateTab(tabValue) {
      this.tab = tabValue;
    },
    async getBoard() {
      this.board.loading = true;
      const url = this.$route.params.url;

      try {
        const response = await getBoardByUrl(url);

        this.board = response.data.board;
      } catch (error) {
        if (error.response.data.code === "BOARD_NOT_FOUND") {
          this.isBoardExist = false;
        }
      } finally {
        this.board.loading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: `${this.board.name} · Board`,
      meta: [
        {
          name: "og:title",
          content: `${this.board.name} · Board · ${this.getSiteSittings.title}`
        },
        !this.board.display
          ? {
            name: "robots",
            content: "noindex"
          }
          : ""
      ]
    };
  }
};
</script>
