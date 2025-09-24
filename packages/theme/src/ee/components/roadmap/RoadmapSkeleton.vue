<template>
  <div
    class="overflow-x-auto h-[500px] grid grid-flow-col gap-x-4 md:gap-x-6 auto-cols-[minmax(22rem,24rem)]"
  >
    <div v-for="i in 3" :key="i" class="flex flex-col gap-2.5 animate-pulse">
      <header class="flex items-center gap-x-1.5">
        <div class="size-2.5 h-3 w-3 rounded-full bg-gray-300"></div>
        <div class="h-3 w-24 bg-gray-300 rounded"></div>
      </header>
      <div class="rounded-md bg-gray-300 p-3 flex-grow space-y-2">
        <div class="h-25 w-full mb-3 bg-(--color-white) rounded"></div>
        <div class="h-25 w-full mb-3 bg-(--color-white) rounded"></div>
        <div class="h-25 w-full mb-3 bg-(--color-white) rounded"></div>
        <div class="h-25 w-full mb-3 bg-(--color-white) rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "RoadmapSkeleton",
});
</script>
