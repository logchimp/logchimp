<template>
  <div>
    <header data-test="roadmap-header" class="roadmap-header">
      <div
        class="color-dot"
        :style="{
          backgroundColor: `#${roadmap.color}`
        }"
      />
      <h6>{{ roadmap.name }}</h6>
    </header>
    <div data-test="roadmap-column" class="roadmap-column">
      <post-card
        v-for="post in posts"
        :key="post.postId"
        :post="post"
      />
    </div>
  </div>
</template>

<script>
// modules
import { getPosts } from "../modules/posts";

// components
import PostCard from "../components/post/PostCard";

export default {
  name: "RoadmapView",
  components: {
    PostCard
  },
  props: {
    roadmap: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      posts: []
    };
  },
  created() {
    this.getRoadmapPosts();
  },
  methods: {
    async getRoadmapPosts() {
      const roadmapId = this.roadmap.id;
      try {
        const response = await getPosts(1, 20, "DESC", null, roadmapId);

        this.posts = response.data.posts;
      } catch (err) {
        console.error(err);
      }
    }
  }
};
</script>
