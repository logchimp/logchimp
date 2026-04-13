<template>
  <div class="border-l border-neutral-300/70 p-4">
    <Votes :postId="postId" />
  </div>
</template>

<script setup lang="ts">
import Votes from "./Votes/Votes.vue";

interface Props {
  postId: string;
}
defineProps<Props>();
</script>
