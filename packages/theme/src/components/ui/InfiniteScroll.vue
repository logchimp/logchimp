<template>
  <div data-test="infinite-scroll" :data-state="state">
    <template v-if="loading">
      <slot name="spinner">
        <div :class="$style['loader-container']">
          <loader />
        </div>
      </slot>
    </template>
    <template v-if="noMoreResults">
      <slot name="no-more" />
    </template>
    <template v-if="noResults">
      <slot name="no-results" />
    </template>
    <template v-if="error">
      <slot name="error">
        <client-error>
          Something went wrong!
        </client-error>
      </slot>
    </template>
  </div>
</template>

<script lang="ts">
export type InfiniteScrollStateType = 'LOADING' | 'LOADED' | 'COMPLETED' | 'ERROR'
</script>

<script setup lang="ts">
import { ref, onMounted, PropType, watch, computed } from "vue"
import { useInfiniteScroll } from '@vueuse/core'

// components
import ClientError from "./ClientError.vue";
import Loader from "./Loader.vue";

const props = defineProps({
  /**
   * The minimum distance between the bottom of the element and the bottom of the viewport
   *
   * @default 20
   */
  distance: {
    type: Number,
    default: 20,
  },
  state: {
    type: String as PropType<InfiniteScrollStateType>
  },
  onInfinite: {
    type: Function
  }
})

const isFirstLoad = ref(true);

const loading = computed<boolean>(() => props.state === "LOADING");
const noMoreResults = computed<boolean>(() => props.state === "COMPLETED" && !isFirstLoad.value);
const noResults = computed<boolean>(() => props.state === "COMPLETED" && isFirstLoad.value);
const error = computed<boolean>(() => props.state === "ERROR");

watch(() => props.state, (newValue) => {
  if (newValue === "LOADED") {
    isFirstLoad.value = false;
  }
})

function executeInfiniteScroll() {
  if (typeof props.onInfinite === 'function' && props.state !== "COMPLETED" && props.state !== "ERROR") {
    props.onInfinite()
  }
}

onMounted(() => executeInfiniteScroll())
useInfiniteScroll(window, () => executeInfiniteScroll(), {
  distance: props.distance,
  direction: 'bottom'
})
</script>

<style module>
.loader-container {
	display: flex;
	justify-content: center;
	margin-bottom: 1rem;
	width: 100%;
}
</style>
