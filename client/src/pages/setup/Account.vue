<template>
  <div class="auth-form">
    <div class="onboarding-header">
      <h2 class="onboarding-heading">
        Create an account
      </h2>
    </div>
    <server-error v-if="serverError" @close="serverError = false" />
    <div class="card">
      <l-text
        v-model="siteTitle.value"
        label="Site title"
        type="text"
        name="Site title"
        placeholder="My awesome site"
        :error="siteTitle.error"
        @keyup-enter="createAccount"
        @hide-error="hideSiteTitleError"
      />
      <l-text
        v-model="fullName.value"
        label="Full name"
        type="text"
        name="Full name"
        placeholder="Mike M. Smit"
        :error="fullName.error"
        @keyup-enter="createAccount"
        @hide-error="hideFullNameError"
      />
      <l-text
        v-model="email.value"
        label="Email address"
        type="text"
        name="Email address"
        placeholder="Eg. email@example.com"
        :error="email.error"
        @keyup-enter="createAccount"
        @hide-error="hideEmailError"
      />
      <l-text
        v-model="password.value"
        label="Password"
        type="password"
        name="Password"
        placeholder="At least 10 character"
        :error="password.error"
        @keyup-enter="createAccount"
        @hide-error="hidePasswordError"
      />
      <div style="display: flex; justify-content: center;">
        <Button
          :loading="buttonLoading"
          type="primary"
          @click="createAccount"
        >
          Create account
        </Button>
      </div>
    </div>
    <p class="auth-form-other">
      By continuing, you agree to LogChimp's <strong>Terms</strong> and
      <strong>Privacy</strong> policy.
    </p>
  </div>
</template>

<script>
// modules
import { siteSetup } from "../../modules/site";

// components
import ServerError from "../../components/serverError";
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
  name: "SetupAccount",
  components: {
    // components
    ServerError,
    LText,
    Button
  },
  data() {
    return {
      siteTitle: {
        value: "",
        error: {
          show: false,
          message: ""
        }
      },
      fullName: {
        value: "",
        error: {
          show: false,
          message: ""
        }
      },
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
  methods: {
    hideSiteTitleError(event) {
      this.siteTitle.error = event;
    },
    hideFullNameError(event) {
      this.fullName.error = event;
    },
    hideEmailError(event) {
      this.email.error = event;
    },
    hidePasswordError(event) {
      this.password.error = event;
    },
    async createAccount() {
      if (
        !(
          this.siteTitle.value &&
					this.fullName.value &&
					this.email.value &&
					this.password.value
        )
      ) {
        if (!this.siteTitle.value) {
          this.siteTitle.error.show = true;
          this.siteTitle.error.message = "Required";
        }

        if (!this.fullName.value) {
          this.fullName.error.show = true;
          this.fullName.error.message = "Required";
        }

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
        const response = await siteSetup(
          this.siteTitle.value,
          this.fullName.value,
          this.email.value,
          this.password.value
        );

        this.$store.dispatch("user/login", {
          ...response.data.user
        });

        this.$store.dispatch("user/updatePermissions");
        this.$router.push("/setup/create-board");
      } catch (error) {
        if (error.response.data.code === "MAIL_CONFIG_MISSING") {
          this.serverError = true;
        }

        console.error(error);
      } finally {
        this.buttonLoading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: "Account · Onboarding",
      meta: [
        {
          name: "og:title",
          content: `Account · Onboarding · ${this.getSiteSittings.title}`
        }
      ]
    };
  }
};
</script>
