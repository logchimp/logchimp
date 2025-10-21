<template>
  <DropdownMenuRoot>
    <slot name="trigger" />

    <DropdownMenuPortal>
      <slot />
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script setup lang="ts">
import { DropdownMenuRoot, DropdownMenuPortal } from "reka-ui";

defineOptions({
  name: "DropdownV2",
});
</script>
