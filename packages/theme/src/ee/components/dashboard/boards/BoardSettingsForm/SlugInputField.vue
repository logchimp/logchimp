<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { CheckCircle2 as CheckCircle } from "lucide-vue";
import { watchDebounced } from "@vueuse/core";

import { checkBoardSlug } from "../../../../modules/boards";

import HelperText from "../../../../../components/ui/input/HelperText.vue";
import LText from "../../../../../components/ui/input/LText.vue";
import Loader from "../../../../../components/icons/Loader.vue";

interface Props {
  currentValue: string;
}
const props = defineProps<Props>();
const emit = defineEmits<(e: "update", value: string) => void>();

const value = ref<string>(props.currentValue || "");
type TDefaultState = {
  available: boolean | undefined;
  loading: boolean;
};
const DEFAULT_STATE: TDefaultState = {
  available: undefined,
  loading: false,
};
const state = reactive(DEFAULT_STATE);

watchDebounced(
  () => value.value,
  async (newValue: string) => {
    const current = props.currentValue;

    emit("update", newValue);

    if (newValue === current) return;
    state.available = undefined;
    state.loading = true;

    try {
      const response = await checkBoardSlug(newValue);
      state.available = response.data.available;
    } catch (err) {
      console.error(err);
    } finally {
      state.loading = false;
    }
  },
  { debounce: 600 },
);

async function validateBoardUrl(event: KeyboardEvent) {
  const key = event.key;

  // allow common shortcuts (copy/paste/select all, etc.)
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  // allow letters, numbers, underscore, and hyphen; plus navigation/edit keys
  const allowed =
    /^[a-zA-Z0-9_-]$/.test(key) ||
    [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ].includes(key);

  if (!allowed) {
    event.preventDefault();
  }

  const target = event.target as HTMLInputElement;
  value.value = target.value.toLowerCase();
}

// Fail-safe in case `value` ref is not able to access `props.currentValue` directly
watch(
  () => props.currentValue,
  (newValue: string) => {
    if (value.value) return;
    value.value = newValue;
  },
);
</script>

<template>
  <div class="grid gap-y-1.5">
    <l-text
      v-model="value"
      label="Slug"
      placeholder="Board slug url"
      class="!mb-0"
      @keydown="validateBoardUrl"
    />
    <HelperText>
      Alphabets, numbers or underscore are allowed.
    </HelperText>

    <!-- Loading / Available / Not available states -->
    <HelperText
      :class="[
        'flex items-center gap-x-1 font-medium transition-opacity',
        value !== currentValue ? 'opacity-100' : 'opacity-0'
      ]"
      aria-hidden="true"
    >
      <template v-if="state.loading">
        <Loader class="spinner stroke-neutral-800 size-4" />
        Loading...
      </template>
      <template v-else-if="state.available">
        <CheckCircle aria-hidden="true" class="size-4 stroke-green-600" />
        Available
      </template>
      <template v-else-if="state.available === false">
        <CheckCircle aria-hidden="true" class="size-4 stroke-red-500" />
        Not available
      </template>
    </HelperText>
  </div>
</template>
