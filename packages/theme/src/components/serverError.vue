<template>
  <div class="server-error">
    <span>
      Something went wrong! Please try again or contact the site owner.
    </span>
    <close-icon @click.native="$emit('close')" />
  </div>
</template>

<script lang="ts">
export default {
  name: "ServerError",
};
</script>

<script setup lang="ts">
// packages
import { X as CloseIcon } from "lucide-vue";
</script>
