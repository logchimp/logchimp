<template>
  <div data-test="infinite-scroll" :data-state="state">
    <template v-if="state === 'LOADING'">
      <slot name="spinner">
        <loader-container />
      </slot>
    </template>
    <template v-if="noMoreResults">
      <slot name="no-more" />
    </template>
    <template v-if="noResults">
      <slot name="no-results" />
    </template>
    <template v-if="state === 'ERROR'">
      <slot name="error">
        <client-error>
          Something went wrong!
        </client-error>
      </slot>
    </template>
     <div ref="infiniteTrigger" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from "vue";
import { useInfiniteScroll } from "@vueuse/core";

// components
import ClientError from "./ClientError.vue";
import LoaderContainer from "./LoaderContainer.vue";

const infiniteTrigger = ref<HTMLElement | null>(null);
export type InfiniteScrollStateType =
  | "LOADING"
  | "LOADED"
  | "COMPLETED"
  | "ERROR";

interface Props {
  /**
   * The minimum distance between the bottom of the element and the bottom of the viewport
   *
   * @default 20
   */
  distance?: number;
  /**
   * @default LOADING
   */
  state?: InfiniteScrollStateType;
  onInfinite: () => Promise<void> | void;
  canLoadMore?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  distance: 20,
  state: "LOADING",
  canLoadMore: true,
});

const isFirstLoad = ref(true);

const noMoreResults = computed<boolean>(
  () => props.state === "COMPLETED" && !isFirstLoad.value,
);
const noResults = computed<boolean>(
  () => props.state === "COMPLETED" && isFirstLoad.value,
);

watch(
  () => props.state,
  (newValue) => {
    if (newValue === "LOADED" || newValue === "COMPLETED") {
      isFirstLoad.value = false;
    }
  },
);

function executeInfiniteScroll() {
  if (props.state === "COMPLETED" || props.state === "ERROR") return;
  props.onInfinite();
}

// 👇 Normal infinite scroll observer
useInfiniteScroll(infiniteTrigger, executeInfiniteScroll, {
  distance: props.distance,
  direction: "bottom",
  canLoadMore: () => !noMoreResults.value || props.state !== "ERROR",
});

// 👇 FIX: Trigger once on mount if page is too short to scroll
onMounted(async () => {
  await nextTick();
  const triggerEl = infiniteTrigger.value;
  if (!triggerEl) return;

  const viewportHeight = window.innerHeight;
  const rect = triggerEl.getBoundingClientRect();

  // If trigger already visible (no scrolling possible)
  if (rect.top < viewportHeight) {
    executeInfiniteScroll();
    console.log("trigger already visible (no scrolling")
  }
});
</script>
