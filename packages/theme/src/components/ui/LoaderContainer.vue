<template>
  <div class="flex justify-center w-full">
    <loader-icon
      class="spinner"
      :class="[
        'size-6 stroke-(--color-gray-80)'
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import LoaderIcon from "../icons/Loader.vue";
</script>
