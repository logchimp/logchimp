<script setup lang="ts">
defineOptions({
  name: "DashboardPageHeader",
});
</script>

<template>
  <header
    :class="[
      'flex items-center justify-between mb-6 px-3 lg:px-6 py-3.5',
      'border-b border-b-neutral-300/70'
    ]"
  >
    <div class="flex items-center gap-x-3">
      <slot name="left" />
    </div>

    <slot />

    <slot name="right" />
  </header>
</template>
