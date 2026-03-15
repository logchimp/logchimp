<script setup lang="ts">
import { useId, computed } from "vue";

// const permission = ref<TPermission>()

interface Props {
  disabled: boolean
  label: string
  id?: string
  note?: string
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

defineEmits<(e: "selected", value: string) => void>()

const id = computed(() => props.id ?? useId())

defineOptions({
  name: "RoleModifyPermissionScope"
})
</script>

<template>
  <div
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
      <select>
        <option value="own">Own</option>
        <option value="any">Any</option>
      </select>
    </div>
  </div>
</template>
