<template>
  <div v-if="isPostExist">
    <h4 class="post-edit-heading">
      Edit post
    </h4>
    <div v-if="!post.loading">
      <l-text
        v-model="post.title.value"
        label="Title"
        type="text"
        name="Post title"
        placeholder="Name of the feature"
        :error="post.title.error"
        :disabled="updatePostPermissionDisabled"
        @keyup-enter="savePost"
        @hide-error="hideTitleError"
      />
      <l-textarea
        v-model="post.contentMarkdown"
        label="Description"
        name="Post description"
        placeholder="What would you use it for?"
        :disabled="updatePostPermissionDisabled"
      />
      <div style="display: flex; justify-content: flex-start;">
        <Button
          type="primary"
          :loading="buttonLoading"
          :disabled="updatePostPermissionDisabled"
          @click="savePost"
        >
          Update
        </Button>
      </div>
    </div>
    <div v-else class="loader-container">
      <loader />
    </div>
  </div>
  <p v-else>
    There is no such post.
  </p>
</template>

<script>
// modules
import { getPostBySlug, updatePost } from "../../../modules/posts";

// components
import Loader from "../../../components/Loader";
import LText from "../../../components/input/LText";
import LTextarea from "../../../components/input/LTextarea";
import Button from "../../../components/Button";

export default {
  name: "PostEdit",
  components: {
    // components
    Loader,
    LText,
    LTextarea,
    Button
  },
  data() {
    return {
      isPostExist: true,
      post: {
        loading: false,
        title: {
          value: "",
          error: {
            show: false,
            message: ""
          }
        },
        contentMarkdown: "",
        postId: "",
        slugId: "",
        author: {},
        slug: ""
      },
      buttonLoading: false
    };
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    },
    updatePostPermissionDisabled() {
      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("post:update");
      const userId = this.$store.getters["user/getUserId"];
      const authorId = this.post.author.userId;
      if (!checkPermission && userId !== authorId) return true;
      return false;
    }
  },
  created() {
    this.getPost();
  },
  methods: {
    hideTitleError(event) {
      this.post.title.error = event;
    },
    async getPost() {
      this.post.loading = true;
      const slug = this.$route.params.slug;

      try {
        const response = await getPostBySlug(slug);

        this.post.title.value = response.data.post.title;
        this.post.contentMarkdown = response.data.post.contentMarkdown;
        this.post.postId = response.data.post.postId;
        this.post.slugId = response.data.post.slugId;
        this.post.author = response.data.post.author;
      } catch (error) {
        if (error.response.data.code === "POST_NOT_FOUND") {
          this.isPostExist = false;
        }
      } finally {
        this.post.loading = false;
      }
    },
    async savePost() {
      if (!this.post.title.value) {
        this.post.title.error.show = true;
        this.post.title.error.message = "Please enter a valid post title";
        return;
      }

      this.buttonLoading = true;

      const postData = {
        id: this.post.postId,
        title: this.post.title.value,
        contentMarkdown: this.post.contentMarkdown,
        slugId: this.post.slugId,
        userId: this.post.author.userId
      };

      try {
        const response = await updatePost(postData);

        this.$router.push(`/posts/${response.data.post.slug}`);
      } catch (error) {
        console.log(error);
      } finally {
        this.buttonLoading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: "Edit post",
      meta: [
        {
          name: "og:title",
          content: `Edit post · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
