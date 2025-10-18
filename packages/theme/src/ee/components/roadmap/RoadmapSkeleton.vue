<template>
  <div
    class="overflow-x-auto h-[500px] grid grid-flow-col gap-x-4 md:gap-x-6 auto-cols-[minmax(22rem,24rem)]"
  >
    <div v-for="i in 3" :key="i" class="flex flex-col gap-2.5 animate-pulse">
      <header class="flex items-center gap-x-1.5">
        <div class="size-2.5 rounded-full bg-(--color-gray-95)"></div>
        <div class="h-3 w-24 bg-(--color-gray-95) rounded"></div>
      </header>
      <div class="rounded-md bg-(--color-gray-95) p-3 flex-grow min-h-0 overflow-y-auto">
        <div class="h-24 w-full mb-3 bg-white rounded"></div>
        <div class="h-24 w-full mb-3 bg-white rounded"></div>
        <div class="h-24 w-full mb-3 bg-white rounded"></div>
        <div class="h-24 w-full mb-3 bg-white rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "RoadmapSkeleton",
});
</script>
