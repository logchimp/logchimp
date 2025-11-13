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
import { useInfiniteScroll } from "@vueuse/core";

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
  /**
   * @default "bottom"
   */
  direction?: "top" | "bottom" | "left" | "right";
  /**
   * Target should be provided for horizontal scrolling
   * @default window
   */
  target?: HTMLElement | Window | null;
}

const props = withDefaults(defineProps<Props>(), {
  distance: 20,
  state: "LOADING",
  canLoadMore: true,
  immediateCheck: true,
  direction: "bottom",
  target: () => window,
});

const isFirstLoad = ref(true);

const noMoreResults = computed<boolean>(
  () => props.state === "COMPLETED" && !isFirstLoad.value,
);
const noResults = computed<boolean>(
  () => props.state === "COMPLETED" && isFirstLoad.value,
);

let cleanupHorizontalScroll: (() => void) | undefined;

watch(
  () => props.state,
  (newValue) => {
    if (newValue === "LOADED" || newValue === "COMPLETED") {
      isFirstLoad.value = false;
    }
  },
);

watch(
  () => props.target,
  (target) => {
    if (cleanupHorizontalScroll) {
      cleanupHorizontalScroll();
      cleanupHorizontalScroll = undefined;
    }
    if (
      target &&
      target instanceof HTMLElement &&
      (props.direction === "left" || props.direction === "right")
    ) {
      target.addEventListener("scroll", handleHorizontalScroll);
      cleanupHorizontalScroll = () =>
        target.removeEventListener("scroll", handleHorizontalScroll);
    }
  },
);

function executeInfiniteScroll() {
  if (props.state === "COMPLETED" || props.state === "ERROR") return;
  props.onInfinite();
}

function handleHorizontalScroll() {
  if (props.state === "COMPLETED" || props.state === "ERROR") {
    return;
  }
  const target = props.target as HTMLElement;

  if (!target) {
    executeInfiniteScroll();
    return;
  }

  const scrollLeft = target.scrollLeft;
  const scrollWidth = target.scrollWidth;
  const clientWidth = target.clientWidth;

  if (props.direction === "right") {
    const distanceFromRight = scrollWidth - (scrollLeft + clientWidth);
    if (distanceFromRight <= props.distance) {
      executeInfiniteScroll();
    }
  } else if (props.direction === "left") {
    if (scrollLeft <= props.distance) {
      executeInfiniteScroll();
    }
  }
}

if (props.direction === "top" || props.direction === "bottom") {
  useInfiniteScroll(props.target, executeInfiniteScroll, {
    distance: props.distance,
    direction: props.direction,
    canLoadMore: () => !noMoreResults.value && props.state !== "ERROR",
  });
}

onMounted(() => {
  if (
    props.immediateCheck &&
    (props.direction === "top" || props.direction === "bottom")
  ) {
    executeInfiniteScroll();
  }

  const target = props.target;

  if (props.direction === "left" || props.direction === "right") {
    if (target && target instanceof HTMLElement) {
      if (props.direction === "right") {
        target.scrollLeft = 0;
      } else if (props.direction === "left") {
        target.scrollLeft = target.scrollWidth;
      }

      cleanupHorizontalScroll = () =>
        target.removeEventListener("scroll", handleHorizontalScroll);
    } else if (props.immediateCheck) {
      handleHorizontalScroll();
    }
  }
});

onUnmounted(() => {
  if (cleanupHorizontalScroll) {
    cleanupHorizontalScroll();
  }
});
</script>
