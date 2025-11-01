<script setup lang="ts">
import { PhCrownSimple } from "@phosphor-icons/vue";

interface Props {
  color?: "white" | "neutral";
}
withDefaults(defineProps<Props>(), {
  color: "white",
});
</script>

<template>
  <PhCrownSimple
    :size="20"
    weight="regular"
    :class="[{
      'fill-white': color === 'white',
      'fill-(--color-neutral-400)': color === 'neutral',
    }]"
  />
</template>
