<template>
  <div>
    <Header />
    <div class="container container-view">
      <router-view />
      <power-by v-if="getSiteSittings.isPoweredBy" />
    </div>
  </div>
</template>

<script>
// components
import Header from "../components/Header";
import PowerBy from "../components/PowerBy";

export default {
  name: "HeaderFooter",
  components: {
    Header,
    PowerBy
  },
  computed: {
    getSiteSittings() {
      return this.$store.getters["settings/get"];
    }
  }
};
</script>
