<template>
  <div class="auth-form">
    <div class="auth-form-header">
      <site-branding />
      <h3 class="auth-form-heading">
        Create your account
      </h3>
    </div>
    <server-error v-if="serverError" @close="serverError = false" />
    <div class="card">
      <l-text
        v-model="email.value"
        label="Email Address"
        type="email"
        name="email"
        placeholder="Email address"
        :error="email.error"
        @keyup-enter="join"
        @hide-error="hideEmailError"
      />
      <l-text
        v-model="password.value"
        label="Password"
        type="password"
        name="password"
        placeholder="Password"
        :error="password.error"
        @keyup-enter="join"
        @hide-error="hidePasswordError"
      />
      <div style="display: flex; justify-content: center">
        <Button
          type="primary"
          :loading="buttonLoading"
          :disabled="!getSiteSittings.allowSignup"
          @click="join"
        >
          Create account
        </Button>
      </div>
    </div>
    <div class="auth-form-other">
      Already have an account?
      <router-link to="/login">
        Log in
      </router-link>
    </div>
  </div>
</template>

<script>
// modules
import { signup } from "../modules/auth";

// component
import ServerError from "../components/serverError";
import LText from "../components/input/LText";
import Button from "../components/Button";
import SiteBranding from "../components/SiteBranding";

export default {
  name: "Join",
  components: {
    // components
    ServerError,
    LText,
    Button,
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
      password: {
        value: "",
        error: {
          show: false,
          message: ""
        }
      },
      buttonLoading: false,
      serverError: false
    };
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    }
  },
  created() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.$router.push("/");
    }
  },
  methods: {
    hideEmailError(event) {
      this.email.error = event;
    },
    hidePasswordError(event) {
      this.password.error = event;
    },
    async join() {
      if (!(this.email.value && this.password.value)) {
        if (!this.email.value) {
          this.email.error.show = true;
          this.email.error.message = "Required";
        }

        if (!this.password.value) {
          this.password.error.show = true;
          this.password.error.message = "Required";
        }

        return;
      }

      this.buttonLoading = true;

      try {
        const response = await signup(this.email.value, this.password.value);

        this.$store.dispatch("user/login", {
          ...response.data.user
        });

        this.$store.dispatch("user/updatePermissions");

        if (this.$route.query.redirect) {
          this.$router.push(this.$route.query.redirect);
        } else {
          this.$router.push("/");
        }
      } catch (error) {
        if (error.response.data.code === "MAIL_CONFIG_MISSING") {
          this.serverError = true;
        }

        if (error.response.data.code === "USER_EXISTS") {
          this.email.error.show = true;
          this.email.error.message = "Exists";
        }
      } finally {
        this.buttonLoading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: "Join",
      meta: [
        {
          name: "og:title",
          content: `Join · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
