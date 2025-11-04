<template>
  <div>
    <header class="form-header">
      <div class="breadcrumbs">
        <h5 class="breadcrum-item">
          Posts
        </h5>
      </div>
    </header>

    <div>
      <post
        v-for="post in posts"
        :key="post.postId"
        :post="post"
        :dashboard="true"
      />
      <infinite-loading @infinite="getBoardPosts">
        <div slot="spinner" class="loader-container">
          <loader />
        </div>
        <div slot="no-more" />
        <div slot="no-results" />
        <div slot="error" />
      </infinite-loading>
    </div>
  </div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getPosts } from "../../../modules/posts";

// components
import Post from "../../../components/post/Post";
import Loader from "../../../components/Loader";

export default {
  name: "DashboardPosts",
  components: {
    // packages
    InfiniteLoading,

    // components
    Post,
    Loader
  },
  data() {
    return {
      posts: [],
      page: 1
    };
  },
  methods: {
    async getBoardPosts($state) {
      try {
        const response = await getPosts(this.page, null, "desc");

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
  },
  metaInfo() {
    return {
      title: "Posts · Dashboard"
    };
  }
};
</script>
