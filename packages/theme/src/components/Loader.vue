<template>
  <div class="loader">
    <loader-icon />
  </div>
</template>

<script lang="ts">
// icons
import LoaderIcon from "./icons/Loader.vue";

export default {
  name: "Loader",
  components: {
    LoaderIcon
  }
};
</script>
