<template>
  <div class="auth-form">
    <div class="auth-form-header">
      <site-branding />
    </div>
    <div v-if="success" class="card">
      <success-icon color="#64B285" />
      <div>
        Thank you verifying your account. You may close this window.
      </div>
    </div>
    <div v-if="error" class="card">
      <error-icon color="#DE544E" />
      <div>
        Invalid or expired activation link.
      </div>
    </div>
    <div v-if="loading" class="email-verification">
      <div class="loader-container">
        <loader />
      </div>
    </div>
  </div>
</template>

<script>
// packages
import { CheckCircle as SuccessIcon, XCircle as ErrorIcon } from "lucide-vue";

// modules
import { verifyUserEmail } from "../modules/auth";

// components
import Loader from "../components/Loader";
import SiteBranding from "../components/SiteBranding";

export default {
  name: "EmailVerification",
  components: {
    // components
    Loader,
    SiteBranding,

    // icons
    SuccessIcon,
    ErrorIcon
  },
  data() {
    return {
      loading: true,
      success: false,
      error: false
    };
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    }
  },
  created() {
    this.verifyEmail();
  },
  methods: {
    async verifyEmail() {
      const token = this.$route.query.token;

      if (!token) {
        this.loading = false;
        this.error = true;
        return;
      }

      try {
        const response = await verifyUserEmail(token);
        if (response.data.verify.success) this.success = true;
      } catch (error) {
        if (error.response.data.code === "USER_ALREADY_VERIFIED") {
          return this.$router.push("/");
        }

        this.error = true;
      } finally {
        this.loading = false;
      }
    }
  },
  metaInfo() {
    return {
      title: "Email verification"
    };
  }
};
</script>
