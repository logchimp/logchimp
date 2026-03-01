<script setup lang="ts">
import { computed } from "vue";

import { useLoginRedirectUrl } from "../../../../hooks/useLoginRedirectUrl.ts";

const href = computed(() => useLoginRedirectUrl());
</script>

<template>
  <div class="border border-neutral-300 rounded-md px-4 py-3 flex items-center justify-between text-sm">
    <div class="font-medium text-neutral-700">
      Login to leave a comment
    </div>

    <div>
      <a :href="href">
        Login
      </a>
    </div>
  </div>
</template>
