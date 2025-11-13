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
import { ref, watch, computed, onMounted } from "vue";
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
  direction?: "top" | "bottom" | "left" | "right";
  target?: HTMLElement | Window;
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

function handleHorizontalScroll() {
  if (
    props.state === "COMPLETED" ||
    props.state === "ERROR" ||
    props.state === "LOADING"
  ) {
    return;
  }
  const target = props.target as HTMLElement;

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

  const target = props.target as HTMLElement;

  if (props.direction === "left" || props.direction === "right") {
    if (props.direction === "right") {
      target.scrollLeft = 0;
    } else if (props.direction === "left") {
      target.scrollLeft = target.scrollWidth;
    }

    target.addEventListener("scroll", handleHorizontalScroll);
    if (props.immediateCheck) {
      handleHorizontalScroll();
    }
  }
});
</script>
