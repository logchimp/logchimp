<template>
  <div class="flex items-center">
    <Td
      :style="{
        width: '40px',
      }"
      class="grip-handler py-2 group/grab"
      :ignore-px="true"
      :ignore-py="true"
    >
      <div
        :class="[
          'flex items-center justify-center',
          'cursor-grab group-hover/grab:bg-neutral-200/70 rounded-md py-2'
        ]"
      >
        <grip-icon
          aria-hidden="true"
          class="stroke-neutral-400 size-5"
        />
      </div>
    </Td>

    <Td
      :style="{
        width: '500px',
      }"
      class="flex-1"
    >
      {{ roadmap.name }}
    </Td>

    <Td>
      <component
        :is="roadmap.display ? EyeIcon : EyeOffIcon"
        aria-hidden="true"
        class="size-5 stroke-neutral-400"
      />
    </Td>

    <Td
      :style="{
        width: '40px',
      }"
      :ignore-px="true"
      :ignore-py="true"
    >
      <div class="flex items-center justify-center">
        <MoreOptionsDropdown />
      </div>
    </Td>
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";
import {
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  GripVertical as GripIcon,
} from "lucide-vue";
import type { IRoadmapPrivate } from "@logchimp/types";

import { roadmapKey } from "./options";
import Td from "../../../../../components/ui/Table/Td.vue";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";

interface Props {
  roadmap: IRoadmapPrivate;
}
const props = defineProps<Props>();
provide(roadmapKey, props.roadmap);

defineOptions({
  name: "DashboardRoadmapTabularItem",
});
</script>
