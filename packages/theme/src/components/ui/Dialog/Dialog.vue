<template>
  <DialogRoot v-model:open="model">
    <DialogPortal>
      <DialogBackdrop :as="DialogOverlay" :is-visible="true" />

      <DialogContent>
        <template #title>
          <slot name="title" />
        </template>

        <slot />

        <template #description>
          <slot name="description" />
        </template>

        <template #footer>
          <slot name="footer" />
        </template>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { DialogOverlay, DialogPortal, DialogRoot } from "reka-ui";

import DialogBackdrop from "../DialogBackdrop.vue";
import DialogContent from "./DialogContent.vue";
import type { DialogContentProps } from "./types";

const model = defineModel<boolean>("open", { default: false });

withDefaults(defineProps<DialogContentProps>(), {
  size: "md",
});
</script>