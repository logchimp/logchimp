<template>
  <div>
    <DropdownV2 :open="isOpen" @update:open="onToggle" :model="false">
      <template #trigger>
        <DropdownMenuTrigger
          :class="[
            'group w-full px-4 outline-none select-none rounded-md',
            'border border-neutral-300 bg-white hover:bg-neutral-50 data-[state=open]:bg-neutral-50',
            'data-[state=open]:ring-4 data-[state=open]:ring-neutral-200/70',
            'text-left text-sm font-medium',
            'flex items-center justify-between gap-x-4',
            roadmap?.id ? 'py-1.5' : 'py-2.5'
          ]"
          :disabled="disabled"
        >
          <template v-if="roadmap?.id">
            <div class="flex items-center gap-x-4">
              <div class="size-4 flex items-center justify-center">
                <color-dot :color="roadmap.color" class="size-3" />
              </div>
              <div>
                <div class="text-md font-semibold line-clamp-1">
                  {{roadmap.name}}
                </div>
                <p class="text-xs text-neutral-500 line-clamp-1 leading-3">
                  {{roadmap.url}}
                </p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="text-neutral-500">
              Select Roadmap
            </div>
          </template>
          <ChevronDown
            aria-hidden="true"
            :class="['stroke-neutral-700 flex-shrink-0 size-6','group-data-[state=open]:rotate-180 transition duration-150']"
          />
        </DropdownMenuTrigger>
      </template>

      <SearchRoadmapDropdownContent :is-open="isOpen" />
    </DropdownV2>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { DropdownMenuTrigger } from "reka-ui";
import { ChevronDown } from "lucide-vue";

import { useRoadmapSearch, type TCurrentRoadmap } from "./search";

import DropdownV2 from "../../../../../components/ui/DropdownV2/Dropdown.vue";
import SearchRoadmapDropdownContent from "./DropdownContent.vue";
import ColorDot from "../../../../../components/ui/ColorDot/ColorDot.vue";

const isOpen = ref<boolean>(false);
const { roadmap, select, clear: clearRoadmapSearch } = useRoadmapSearch();

interface Props {
  disabled?: boolean;
  roadmap: TCurrentRoadmap;
}
const emit = defineEmits<(e: "selected", value: TCurrentRoadmap) => void>();
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

function onToggle(e: boolean) {
  isOpen.value = e;
}

watch(roadmap, (value: TCurrentRoadmap) => {
  isOpen.value = false;
  emit("selected", value);
});

onMounted(() => {
  clearRoadmapSearch();
  if (props.roadmap) {
    select(props.roadmap);
  }
});

defineOptions({
  name: "SearchRoadmapDropdown",
});
</script>
