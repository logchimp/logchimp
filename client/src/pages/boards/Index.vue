<template>
  <div>
    <div v-if="boards.length > 0" class="boards-lists">
      <board-item
        v-for="board in boards"
        :key="board.boardId"
        :name="board.name"
        :color="board.color"
        :url="board.url"
        :post-count="Number(board.post_count)"
      />
    </div>
    <infinite-loading @infinite="getBoards">
      <div slot="spinner" class="loader-container">
        <loader />
      </div>
      <div slot="no-more" />
      <div slot="no-results" />
      <div slot="error" />
    </infinite-loading>
  </div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getPublicBoards } from "../../modules/boards";

// components
import BoardItem from "../../components/board/BoardItem";
import Loader from "../../components/Loader";

export default {
  name: "Boards",
  components: {
    // packages
    InfiniteLoading,

    // components
    BoardItem,
    Loader
  },
  data() {
    return {
      boards: [],
      page: 1
    };
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    }
  },
  methods: {
    async getBoards($state) {
      try {
        const response = await getPublicBoards(this.page, null, "desc");

        if (response.data.boards.length) {
          this.boards.push(...response.data.boards);
          this.page += 1;
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (error) {
        console.error(error);
        $state.error();
      }
    }
  },
  metaInfo() {
    return {
      title: "Boards",
      meta: [
        {
          name: "og:title",
          content: `Boards · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
