<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "reka-ui";

import { DEFAULT_LOGCHIMP_PILOT_URL, IS_DEV, IS_PROD } from "../../constants";

interface Props {
  hasValidLicense: boolean;
}

defineProps<Props>();
</script>

<template>
  <slot v-if="hasValidLicense" />
  <TooltipProvider v-else>
    <TooltipRoot>
      <TooltipTrigger
        :disabled="IS_PROD && !hasValidLicense"
      >
        <slot />
      </TooltipTrigger>

      <TooltipPortal>
        <TooltipContent
          :class="[
            'animate-slide-up-fade pointer-events-auto z-[99] items-center overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm',
          ]"
          :side-offset="10"
        >
          <div class="flex max-w-xs flex-col items-center p-4 text-center text-sm text-neutral-700">
            <template v-if="IS_DEV">
              You can test this feature locally but not on production.
            </template>
            <template v-else>
              This is a commercial feature.
              To purchase a commercial license, please reach out to our sales team.
            </template>
            <a class="underline" :href="DEFAULT_LOGCHIMP_PILOT_URL">
              Contact Sales
            </a>
          </div>
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>