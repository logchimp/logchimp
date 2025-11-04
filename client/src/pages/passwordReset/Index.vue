<template>
  <div class="auth-form">
    <div class="auth-form-header">
      <site-branding />
      <h3 class="auth-form-heading">
        Forget password
      </h3>
    </div>
    <server-error v-if="serverError" @close="serverError = false" />
    <div v-if="!hideForm" class="card">
      <l-text
        v-model="email.value"
        label="Email Address"
        type="email"
        name="email"
        placeholder="Email address"
        :error="email.error"
        @keyup-enter="forgetPassword"
        @hide-error="hideEmailError"
      />
      <div style="display: flex; justify-content: center;">
        <Button
          type="primary"
          :loading="buttonLoading"
          @click="forgetPassword"
        >
          Continue
        </Button>
      </div>
    </div>
    <div v-if="requestSuccess" class="card">
      <p>You will receive a password reset email soon.</p>
      <br>
      <p>Follow the link in the email to reset your password.</p>
    </div>
    <div v-if="requestError" class="card">
      <p>Something went wrong!</p>
    </div>
    <div v-if="getSiteSittings.allowSignup" class="auth-form-other">
      Don't have an account yet?
      <router-link to="/join">
        Sign up
      </router-link>
    </div>
  </div>
</template>

<script>
// modules
import { requestPasswordReset } from "../../modules/auth";

// component
import ServerError from "../../components/serverError";
import LText from "../../components/input/LText";
import Button from "../../components/Button";
import SiteBranding from "../../components/SiteBranding";

export default {
  name: "ForgetPassword",
  components: {
    // component
    LText,
    Button,
    ServerError,
    SiteBranding
  },
  data() {
    return {
      email: {
        value: "",
        error: {
          show: false,
          message: ""
        }
      },
      hideForm: false,
      requestSuccess: false,
      requestError: false,
      buttonLoading: false,
      serverError: false
    };
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    }
  },
  methods: {
    hideEmailError(event) {
      this.email.error = event;
    },
    async forgetPassword() {
      if (!this.email.value) {
        this.email.error.show = true;
        this.email.error.message = "Required";
        return;
      }

      this.buttonLoading = true;

      try {
        const response = await requestPasswordReset(this.email.value);

        this.hideForm = true;
        if (response.data.reset.success) {
          this.requestSuccess = true;
        } else {
          this.requestError = true;
        }
      } catch (error) {
        if (error.response.data.code === "MAIL_CONFIG_MISSING") {
          this.serverError = true;
        }

        if (error.response.data.code === "USER_NOT_FOUND") {
          this.email.error.show = true;
          this.email.error.message = "User not found";
        }
      } finally {
        this.buttonLoading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: "Forget password",
      meta: [
        {
          name: "og:title",
          content: `Forget password · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
