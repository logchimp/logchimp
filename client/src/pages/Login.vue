<template>
  <div class="auth-form">
    <div class="auth-form-header">
      <site-branding />
      <h3 class="auth-form-heading">
        Welcome back!
      </h3>
    </div>
    <div class="card">
      <l-text
        v-model="email.value"
        label="Email Address"
        type="email"
        name="email"
        placeholder="Email address"
        :error="email.error"
        @keyup-enter="login"
        @hide-error="hideEmailError"
      />
      <l-text
        v-model="password.value"
        label="Password"
        type="password"
        name="password"
        placeholder="Password"
        :error="password.error"
        @keyup-enter="login"
        @hide-error="hidePasswordError"
      />
      <div style="display: flex; justify-content: center">
        <Button
          type="primary"
          :loading="buttonLoading"
          @click="login"
        >
          Login
        </Button>
      </div>
    </div>
    <div class="auth-form-other">
      <router-link to="/password-reset">
        Forget password?
      </router-link>
      <div v-if="getSiteSittings.allowSignup">
        · Don't have an account yet?
        <router-link to="/join">
          Sign up
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
// modules
import { signin } from "../modules/auth";

// component
import LText from "../components/input/LText";
import Button from "../components/Button";
import SiteBranding from "../components/SiteBranding";

export default {
  name: "Login",
  components: {
    // component
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
      buttonLoading: false
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
    async login() {
      if (!(this.email.value && this.password.value)) {
        if (!this.email.value) {
          this.email.error.show = true;
          this.email.error.message = "Required";
        }
        if (!this.password.value) {
          this.password.error.show = true;
          this.password.error.message = "Required";
        }
      }

      this.buttonLoading = true;

      try {
        const response = await signin(this.email.value, this.password.value);
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
        if (error.response.data.code === "USER_NOT_FOUND") {
          this.email.error.show = true;
          this.email.error.message = "User not found";
        }

        if (error.response.data.code === "INCORRECT_PASSWORD") {
          this.password.error.show = true;
          this.password.error.message = "Incorrect password";
        }
      } finally {
        this.buttonLoading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: "Login",
      meta: [
        {
          name: "og:title",
          content: `Login · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
