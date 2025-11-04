<template>
  <div>
    <h4 class="form-header">
      Account settings
    </h4>
    <div v-if="!user.loading">
      <server-error v-if="serverError" @close="serverError = false" />
      <div v-if="!userIsVerified" class="user-settings-verification">
        <div class="user-settings-verification-content">
          <alert-icon />
          <div class="user-settings-verification-text">
            <h6>Email verification</h6>
            <p>
              We’ve sent you an verification email. Please follow the
              instructions in the email.
            </p>
          </div>
        </div>

        <Button
          type="background"
          :loading="resendVerificationEmailButtonLoading"
          @click="resendEmail"
        >
          Resend
        </Button>
      </div>
      <l-text
        v-model="user.name.value"
        label="Name"
        type="text"
        name="Name"
        placeholder="Full name"
        class="user-settings-name-item"
        @keyup-enter="updateSettings"
      />
      <l-text
        v-model="user.username.value"
        label="Username"
        type="text"
        name="Username"
        placeholder="Username"
        :disabled="true"
      />
      <l-text
        v-model="user.email.value"
        label="Email Address"
        type="text"
        name="Email Address"
        placeholder="Email address"
        :disabled="true"
      />
      <div style="display: flex; justify-content: flex-start">
        <Button
          type="primary"
          :loading="updateUserButtonLoading"
          @click="updateSettings"
        >
          Update
        </Button>
      </div>
    </div>
    <div v-else class="loader-container">
      <loader />
    </div>
  </div>
</template>

<script>
// packages
import { AlertTriangle as AlertIcon } from "lucide-vue";

// modules
import { getUserSettings, updateUserSettings } from "../modules/users";
import { resendUserVerificationEmail } from "../modules/auth";

// components
import Loader from "../components/Loader";
import ServerError from "../components/serverError";
import LText from "../components/input/LText";
import Button from "../components/Button";

// utils
import tokenError from "../utils/tokenError";

export default {
  name: "UserSettings",
  components: {
    // components
    Loader,
    ServerError,
    LText,
    Button,

    // icons
    AlertIcon
  },
  data() {
    return {
      user: {
        loading: false,
        name: {
          value: ""
        },
        username: {
          value: ""
        },
        email: {
          value: ""
        },
        isVerified: false
      },
      serverError: false,
      resendVerificationEmailButtonLoading: false,
      updateUserButtonLoading: false
    };
  },
  computed: {
    userIsVerified() {
      return this.user.isVerified;
    },
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    }
  },
  created() {
    const userId = this.$store.getters["user/getUserId"];

    if (userId) {
      this.getUser();
    } else {
      this.$router.push({
        path: "/login",
        query: {
          redirect: "/settings"
        }
      });
    }
  },
  methods: {
    async getUser() {
      this.user.loading = true;

      try {
        const response = await getUserSettings();

        this.user.name.value = response.data.user.name;
        this.user.username.value = response.data.user.username;
        this.user.email.value = response.data.user.email;
        this.user.isVerified = response.data.user.isVerified;
      } catch (error) {
        tokenError(error);
      } finally {
        this.user.loading = false;
      }
    },
    async updateSettings() {
      this.updateUserButtonLoading = true;

      const userData = {
        name: this.user.name.value
      };

      try {
        const response = await updateUserSettings(userData);
        this.user.name.value = response.data.user.name;
      } catch (error) {
        tokenError(error);
      } finally {
        this.updateUserButtonLoading = false;
      }
    },
    async resendEmail() {
      this.resendVerificationEmailButtonLoading = true;

      try {
        const email = this.user.email.value;
        await resendUserVerificationEmail(email);
      } catch (error) {
        if (error.response.data.code === "MAIL_CONFIG_MISSING") {
          this.serverError = true;
        }

        console.error(error);
      } finally {
        this.resendVerificationEmailButtonLoading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: "User settings",
      meta: [
        {
          name: "og:title",
          content: `User settings · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
