<template>
  <div class="font-medium px-2" aria-hidden="true">
    <slot v-if="$slots.default" />
    <template v-else>
      /
    </template>
  </div>
</template>
