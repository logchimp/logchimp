<template>
  <DialogClose
    class="p-1.5 rounded-full bg-neutral-200 cursor-pointer"
    :aria-label="t('actions.close')"
  >
    <CloseIcon class="stroke-neutral-700 size-4" aria-hidden="true" />
  </DialogClose>
</template>

<script setup lang="ts">
import { DialogClose } from "reka-ui";
import { X as CloseIcon } from "lucide-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
