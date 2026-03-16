<script setup lang="ts">
import { useId, computed } from "vue";

interface Props {
  disabled?: boolean;
  label: string;
  id?: string;
  note?: string;
  modelValue: string;
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});
const emit = defineEmits<(e: "update:modelValue", value: string) => void>();

const id = computed(() => props.id ?? useId());

function onSelectUpdate(e: Event) {
  const target = e.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
}

defineOptions({
  name: "RoleModifyPermissionScope",
});
</script>

<template>
  <div
    class="flex items-center justify-between"
    :class="{
      'opacity-60': disabled,
    }"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <div>
      <label
        :for="id"
      >
        {{ label }}
      </label>
      <p
        v-if="note"
       data-test="toggle-item-note"
       class="mt-2 text-sm text-(--color-gray-50)"
      >
        {{note}}
      </p>
    </div>

    <div>
      <!-- dropdown -->
      <select
        :modelValue="modelValue"
        @change="onSelectUpdate"
      >
        <option value="none">None</option>
        <option value="own">Own</option>
        <option value="any">Any</option>
      </select>
    </div>
  </div>
</template>
