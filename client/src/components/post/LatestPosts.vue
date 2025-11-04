<template>
  <div>
    <post
      v-for="post in posts"
      :key="post.postId"
      :post="post"
      :show-board="false"
    />
    <infinite-loading @infinite="getMorePosts">
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
import { getPosts } from "../../modules/posts";

// components
import Post from "../post/Post";
import Loader from "../Loader";

export default {
  name: "LatestPosts",
  components: {
    // packages
    InfiniteLoading,

    // components
    Post,
    Loader
  },
  props: {
    board: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      posts: [],
      page: 1
    };
  },
  methods: {
    async getMorePosts($state) {
      const boardId = this.board.boardId;

      try {
        const response = await getPosts(this.page, 10, "desc", [boardId]);

        if (response.data.posts.length) {
          this.posts.push(...response.data.posts);
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
  }
};
</script>
