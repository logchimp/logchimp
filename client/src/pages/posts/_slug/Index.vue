<template>
  <div v-if="!post.loading">
    <div v-if="isPostExist" class="viewpost">
      <div class="viewpost__vote">
        <div>
          <vote
            :post-id="post.postId"
            :votes-count="post.voters.votesCount"
            :is-voted="post.voters.viewerVote"
            @update-voters="updateVoters"
          />
        </div>
        <div class="viewpost__content">
          <h2 class="viewpost__title">
            {{ post.title }}
          </h2>
          <div class="viewpost__meta">
            <div class="viewpost__meta-author">
              <avatar
                class="viewpost__author-avatar"
                :src="post.author.avatar"
                :name="post.author.name"
              />
              {{ postAuthorName }}
            </div>
            <div class="viewpost__meta-divider">
              |
            </div>
            <time
              :datetime="post.createdAt"
              :title="$date(post.createdAt).format('dddd, DD MMMM YYYY hh:mm')"
              class="post-date"
            >
              {{ $date(post.createdAt).from() }}
            </time>
            <dropdown-wrapper v-if="postAuthor" class="viewpost__menu">
              <template #toggle>
                <div class="dropdown-menu-icon">
                  <more-icon />
                </div>
              </template>
              <template #default="dropdown">
                <dropdown
                  v-if="dropdown.active"
                  class="viewpost__menu-dropdown"
                >
                  <dropdown-item @click="editPost">
                    <template #icon>
                      <edit-icon />
                    </template>
                    Edit
                  </dropdown-item>
                </dropdown>
              </template>
            </dropdown-wrapper>
          </div>
        </div>
      </div>

      <p v-html="post.contentMarkdown" />

      <div v-if="showPostActivity" class="activity-section">
        <div class="card">
          <l-text
            v-model="comment.value"
            name="comment"
            placeholder="Leave a comment"
            @keyup-enter="submitComment"
          />

          <div style="display: flex; justify-content: flex-end;">
            <Button
              type="primary"
              :loading="comment.buttonLoading"
              :disabled="!comment.value"
              @click="submitComment"
            >
              Submit
            </Button>
          </div>
        </div>

        <header class="activity-header">
          <h6>activity</h6>

          <!-- <div class="activity-sort">
            <div
              class="sort-option"
              :class="{
                'sort-option-active': activity.sort === 'desc'
              }"
              @click="activity.sort = 'desc'"
            >
              Newest
            </div>
            <div
              class="sort-option"
              :class="{
                'sort-option-active': activity.sort === 'asc'
              }"
              @click="activity.sort = 'asc'"
            >
              Oldest
            </div>
          </div> -->
        </header>

        <div v-if="!activity.loading" class="activity-list">
          <activity-item
            v-for="item in activity.data"
            :key="item.id"
            :activity="item"
          />
        </div>
        <div v-else class="loader-container">
          <loader />
        </div>
      </div>
    </div>
    <p v-else>
      There is no such post.
    </p>
  </div>
  <div v-else class="loader-container">
    <loader />
  </div>
</template>

<script>
// packages
import { MoreHorizontal as MoreIcon, Edit2 as EditIcon } from "lucide-vue";

// modules
import { getPostBySlug, addComment, postActivity } from "../../../modules/posts";

// components
import Loader from "../../../components/Loader";
import Vote from "../../../components/post/Vote";
import DropdownWrapper from "../../../components/dropdown/DropdownWrapper";
import Dropdown from "../../../components/dropdown/Dropdown";
import DropdownItem from "../../../components/dropdown/DropdownItem";
import Avatar from "../../../components/Avatar";
import LText from "../../../components/input/LText";
import Button from "../../../components/Button";
import ActivityItem from "../../../components/ActivityItem/ActivityItem";

export default {
  name: "PostView",
  components: {
    // components
    Loader,
    Vote,
    DropdownWrapper,
    Dropdown,
    DropdownItem,
    Avatar,
    LText,
    Button,
    ActivityItem,

    // icons
    MoreIcon,
    EditIcon
  },
  data() {
    return {
      post: {
        loading: false
      },
      isPostExist: true,
      comment: {
        value: "",
        buttonLoading: false
      },
      activity: {
        loading: false,
        sort: "desc",
        data: []
      }
    };
  },
  computed: {
    postAuthorName() {
      return this.post.author.name
        ? this.post.author.name
        : this.post.author.username;
    },
    postAuthor() {
      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("post:update");
      const userId = this.$store.getters["user/getUserId"];
      const authorId = this.post.author.userId;

      if (!checkPermission && userId !== authorId) return false;
      return true;
    },
    showPostActivity() {
      return this.$store.getters["settings/labs"].comments;
    },
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    }
  },
  watch: {
    // Get post activity on changing sort
    "activity.sort": {
      handler(value) {
        this.getPostActivity(value);
      }
    }
  },
  created() {
    this.postBySlug();
  },
  methods: {
    async postBySlug() {
      this.post.loading = true;
      const slug = this.$route.params.slug;

      try {
        const response = await getPostBySlug(slug);

        this.post = response.data.post;
        this.getPostActivity();
      } catch (error) {
        if (error.response.data.code === "POST_NOT_FOUND") {
          this.isPostExist = false;
        }
      } finally {
        this.post.loading = false;
      }
    },
    async getPostActivity(sort = "desc") {
      this.activity.loading = true;

      try {
        const response = await postActivity({
          post_id: this.post.postId,
          sort
        });

        this.activity.data = response.data.activity;
      } catch (error) {
        console.log(error);
      } finally {
        this.activity.loading = false;
      }
    },
    async submitComment() {
      if (!this.comment.value) return;

      try {
        const response = await addComment({
          post_id: this.post.postId,
          body: this.comment.value,
          is_internal: false
        });

        this.comment.value = "";
        this.activity.data.unshift(response.data.comment);
      } catch (error) {
        console.log(error);
      }
    },
    updateVoters(voters) {
      this.post.voters.votesCount = voters.votesCount;
      this.post.voters.viewerVote = voters.viewerVote;
    },
    editPost() {
      this.$router.push(`/posts/${this.post.slug}/edit`);
    }
  },
  metaInfo() {
    return {
      title: `${this.post.title} · Post`,
      meta: [
        {
          name: "description",
          content: `${this.post.contentMarkdown}`
        },

        // openGraph
        {
          name: "og:title",
          content: `${this.post.title} · Post · ${this.getSiteSittings.title}`
        },
        {
          name: "og:description",
          content: `${this.post.contentMarkdown}`
        }
      ]
    };
  }
};
</script>
