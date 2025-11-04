<template>
  <div class="auth-form">
    <div class="onboarding-header">
      <h2 class="onboarding-heading">
        Create a new board
      </h2>
      <p class="onboarding-label">
        A board is a place where people can post and vote on ideas for a
        specific topic.
      </p>
    </div>
    <div class="card">
      <l-text
        v-model="boardName.value"
        label="Name"
        type="text"
        name="Name"
        placeholder="Name of the board"
        :error="boardName.error"
        @keyup-enter="create"
        @hide-error="hideBoardNameError"
      />
      <div style="display: flex; justify-content: center;">
        <Button
          :loading="buttonLoading"
          :disabled="createBoardPermissionDisabled"
          type="primary"
          @click="create"
        >
          Create
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
// modules
import { createBoard } from "../../modules/boards";

// components
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
  name: "SetupBoard",
  components: {
    // components
    LText,
    Button
  },
  data() {
    return {
      boardName: {
        value: "",
        error: {
          show: false,
          message: ""
        }
      },
      buttonLoading: false
    };
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    },
    createBoardPermissionDisabled() {
      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("board:create");
      return !checkPermission;
    }
  },
  methods: {
    hideBoardNameError(event) {
      this.boardName.error = event;
    },
    async create() {
      if (!this.boardName.value) {
        this.boardName.error.show = true;
        this.boardName.error.message = "Required";
        return;
      }

      this.buttonLoading = true;

      try {
        await createBoard(this.boardName.value);

        this.$router.push("/dashboard");
      } catch (error) {
        console.error(error);
      } finally {
        this.buttonLoading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: "Create board · Onboarding",
      meta: [
        {
          name: "og:title",
          content: `Create board · Onboarding · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
