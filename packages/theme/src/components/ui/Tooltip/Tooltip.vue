<template>
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger>
        <slot name="trigger" />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :class="[
            'animate-slide-up-fade pointer-events-auto items-center',
            'overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm',
            'text-xs px-2 py-1 text-neutral-700'
          ]"
          :side-offset="10"
        >
          <slot />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
} from "reka-ui";
</script>
