<template>
  <div
    id="app"
    :style="{
      '--brand-color': `#${getSiteSittings.accentColor}`
    }"
  >
    <div class="alerts">
      <Alert
        v-for="(alert, index) in getAlerts"
        :key="alert.time"
        :title="alert.title"
        :type="alert.type"
        :timeout="alert.timeout"
        @remove="removeAlert(index)"
      />
    </div>
    <router-view />
  </div>
</template>

<script>
// packages
import axios from "axios";
import gtag, { setOptions, bootstrap } from "vue-gtag";
import packageJson from "../package.json";

// components
import Alert from "./components/Alert";

export default {
  name: "App",
  components: {
    Alert
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    },
    getAlerts() {
      const alerts = this.$store.getters["alerts/getAlerts"];
      return alerts;
    },
    logchimpVersion() {
      return packageJson.version;
    }
  },
  created() {
    // remove this code some point in future
    // a fail-safe to fix the issue on existing LogChimp sites
    localStorage.removeItem("settings");

    this.getSiteSettings();

    // set google analytics
    if (this.getSiteSittings.googleAnalyticsId) {
      setOptions({
        config: {
          id: this.getSiteSittings.googleAnalyticsId
        }
      });

      bootstrap(gtag).then();
    }

    const user = localStorage.getItem("user");
    if (user) {
      this.$store.dispatch("user/login", JSON.parse(user));
      this.$store.dispatch("user/updatePermissions");
    }
  },
  methods: {
    removeAlert(alert) {
      this.$store.dispatch("alerts/remove", alert);
    },
    getSiteSettings() {
      axios({
        method: "get",
        url: "/api/v1/settings/site"
      })
        .then(response => {
          this.$store.dispatch("settings/update", response.data.settings);
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  metaInfo() {
    return {
      titleTemplate: `%s · ${this.getSiteSittings.title}`,
      meta: [
        {
          name: "generator",
          content: `LogChimp v${this.logchimpVersion}`
        },
        {
          name: "description",
          content: `${this.getSiteSittings.description}. Powered By LogChimp.`
        },
        {
          name: "robots",
          content: "index, follow"
        },
        {
          rel: "canonical",
          href: this.$route.fullPath
        },
        {
          name: "language",
          content: "es"
        },
        {
          name: "copyright",
          content: this.getSiteSittings.title
        },

        // openGraph
        {
          name: "og:type",
          content: "website"
        },
        {
          name: "og:description",
          content: `${this.getSiteSittings.description}. Powered By LogChimp.`
        }
      ]
    };
  }
};
</script>
