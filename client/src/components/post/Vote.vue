<template>
  <div
    class="post-voters"
    data-test="vote"
    :class="[
      loading ? 'post-voters-loading' : '',
      disabled ? 'post-voters-disabled' : ''
    ]"
    @click="changeVote"
  >
    <arrow-icon
      class="post-voters-arrow"
      data-test="vote-arrow"
      :class="{ 'post-voters-vote': isVoted }"
    />
    <span data-test="vote-count">{{ votesCount }}</span>
  </div>
</template>

<script>
// modules
import { addVote, deleteVote } from "../../modules/votes";

// icons
import ArrowIcon from "../icons/Arrow";

// utils
import validateUUID from "../../utils/validateUUID";
import tokenError from "../../utils/tokenError";

export default {
  name: "Vote",
  components: {
    ArrowIcon
  },
  props: {
    postId: {
      type: String,
      required: true,
      validator: validateUUID
    },
    votesCount: {
      type: Number,
      default: 0
    },
    isVoted: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    disabled() {
      const getUserId = this.$store.getters["user/getUserId"];
      if (!getUserId) return false;

      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("vote:create");
      return !checkPermission;
    }
  },
  methods: {
    async changeVote() {
      if (this.loading) return;
      if (this.disabled) return;

      this.loading = true;

      if (this.isVoted) {
        try {
          const response = await deleteVote(this.postId);

          this.$emit("update-voters", response.data.voters);
        } catch (error) {
          tokenError(error);
        } finally {
          this.loading = false;
        }
      } else {
        try {
          const response = await addVote(this.postId);

          this.$emit("update-voters", response.data.voters);
        } catch (error) {
          tokenError(error);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>
