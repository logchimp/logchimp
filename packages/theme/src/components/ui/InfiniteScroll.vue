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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { useInfiniteScroll, useOnline } from "@vueuse/core";

// components
import ClientError from "./ClientError.vue";
import LoaderContainer from "./LoaderContainer.vue";

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
  /**
   * Useful when the content is not tall enough to fill up the scrollable container.
   * @default true
   */
  immediateCheck?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  distance: 20,
  state: "LOADING",
  canLoadMore: true,
  immediateCheck: true,
});

const isFirstLoad = ref(true);
const isOnline = useOnline();

// Track whether a load was deferred while offline so we can retry on reconnect
const pendingRetry = ref(false);

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

// When the network comes back online, retry any deferred load
watch(isOnline, (online) => {
  if (online && pendingRetry.value) {
    pendingRetry.value = false;
    executeInfiniteScroll();
  }
});

function executeInfiniteScroll() {
  if (props.state === "COMPLETED" || props.state === "ERROR") return;

  // Skip API call when offline; mark as pending so we retry on reconnect
  if (!isOnline.value) {
    pendingRetry.value = true;
    return;
  }

  props.onInfinite();
}

useInfiniteScroll(window, executeInfiniteScroll, {
  distance: props.distance,
  direction: "bottom",
  canLoadMore: () => !noMoreResults.value || props.state !== "ERROR",
});

onMounted(() => {
  if (props.immediateCheck) {
    executeInfiniteScroll();
  }
});

onUnmounted(() => {
  pendingRetry.value = false;
});
</script>
