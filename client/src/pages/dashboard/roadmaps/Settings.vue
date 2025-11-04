<template>
  <div>
    <header class="form-header">
      <div class="breadcrumbs">
        <router-link to="/dashboard/roadmaps" class="breadcrum-item">
          Roadmaps
        </router-link>
        <div class="breadcrum-divider">
          /
        </div>
        <h5 class="breadcrum-item">
          {{ title }}
        </h5>
      </div>

      <Button
        type="primary"
        :loading="updateButtonLoading"
        :disabled="updateRoadmapButtonDisabled"
        @click="update"
      >
        Save
      </Button>
    </header>

    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="roadmap.name"
            label="Name"
            placeholder="Enter roadmap name"
          />

          <color-input v-model="roadmap.color" />
        </div>

        <div class="form-column">
          <l-text
            v-model="roadmap.url"
            label="Slug"
            placeholder="Roadmap slug url"
            :description="slimUrl"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">
        Privacy
      </h6>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="roadmap.display"
            label="Display on site"
            note="Show this roadmap on the site"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// modules
import { getRoadmapByUrl, updateRoadmap } from "../../../modules/roadmaps";

// components
import Button from "../../../components/Button";
import LText from "../../../components/input/LText";
import ToggleItem from "../../../components/input/ToggleItem";
import ColorInput from "../../../components/ColorInput";

export default {
  name: "DashbordRoadmapSettings",
  components: {
    Button,
    LText,
    ToggleItem,
    ColorInput
  },
  data() {
    return {
      title: "",
      roadmap: {
        name: "",
        url: "",
        color: "",
        display: false
      },
      updateButtonLoading: false
    };
  },
  computed: {
    updateRoadmapButtonDisabled() {
      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("roadmap:update");
      return !checkPermission;
    },
    slimUrl() {
      return this.roadmap.url
        .replace(/[^\w]+/gi, "-")
        .trim()
        .toLowerCase();
    }
  },
  created() {
    this.getRoadmap();
  },
  methods: {
    async update() {
      this.updateButtonLoading = true;
      console.log("update roadmap");
      try {
        const response = await updateRoadmap({
          id: this.roadmap.id,
          ...this.roadmap
        });

        if (response.status === 200) {
          this.$router.push("/dashboard/roadmaps");
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.updateButtonLoading = false;
      }
    },
    async getRoadmap() {
      const url = this.$route.params.url;
      try {
        const response = await getRoadmapByUrl(url);

        this.roadmap = response.data.roadmap;
        this.title = response.data.roadmap.name;
      } catch (err) {
        console.error(err);
      }
    }
  },
  metaInfo() {
    return {
      title: `${this.title} · Settings · Roadmap · Dashboard`
    };
  }
};
</script>
