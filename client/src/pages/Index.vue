<template>
  <div class="homepage">
    <main class="homepage-posts">
      <post
        v-for="post in posts"
        :key="post.postId"
        :post="post"
      />
      <infinite-loading @infinite="getBoardPosts">
        <div slot="spinner" class="loader-container">
          <loader />
        </div>
        <div slot="no-more" />
        <div slot="no-results" />
        <div slot="error" />
      </infinite-loading>
    </main>
    <aside class="homepage-sidebar">
      <site-setup-card v-if="showSiteSetupCard" />
      <login-card v-if="!isUserLoggedIn && !showSiteSetupCard" />
    </aside>
  </div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// modules
import { isSiteSetup } from "../modules/site";
import { getPosts } from "../modules/posts";

// components
import Post from "../components/post/Post";
import Loader from "../components/Loader";
import SiteSetupCard from "../components/SiteSetupCard";
import LoginCard from "../components/LoginCard";

export default {
  name: "Homepage",
  components: {
    // packages
    InfiniteLoading,

    // components
    Post,
    Loader,
    SiteSetupCard,
    LoginCard
  },
  data() {
    return {
      posts: [],
      page: 1,
      showSiteSetupCard: false
    };
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    },
    isUserLoggedIn() {
      const user = this.$store.getters["user/getUserId"];
      return !!user;
    }
  },
  created() {
    this.isSetup();
  },
  methods: {
    async isSetup() {
      try {
        const response = await isSiteSetup();
        this.showSiteSetupCard = !response.data.is_setup;
      } catch (error) {
        console.error(error);
      }
    },
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
      title: "Home",
      meta: [
        {
          name: "og:title",
          content: `Home · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
