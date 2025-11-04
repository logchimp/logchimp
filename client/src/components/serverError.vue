<template>
  <div class="server-error">
    <span>
      Something went wrong! Please try again or contact the site owner.
    </span>
    <close-icon @click.native="$emit('close')" />
  </div>
</template>

<script>
// packages
import { X as CloseIcon } from "lucide-vue";

export default {
  name: "ServerError",
  components: {
    // icons
    CloseIcon
  }
};
</script>
