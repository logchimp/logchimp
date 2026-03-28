<template>
  <div class="flex items-center">
    <Td />
    <Td
      :style="{
        minWidth: '500px',
      }"
      class="flex-1 line-clamp-1 truncate hover:line-clamp-none hover:break-all hover:whitespace-normal"
    >
      {{ role.name }}
    </Td>

    <Td>
      <TooltipProvider v-if="role.isSystem">
        <TooltipRoot>
          <TooltipTrigger>
            <ComputerIcon class="size-5 stroke-neutral-400" />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              System role
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </TooltipProvider>
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
import { ComputerIcon } from "lucide-vue";
import type { IRole } from "@logchimp/types";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "reka-ui";

import { roleIdKey } from "./options";
import Td from "../../../../../components/ui/Table/Td.vue";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";

interface Props {
  role: IRole;
}
const props = defineProps<Props>();

provide(roleIdKey, props.role.id);

defineOptions({
  name: "DashboardRolesTabularItem",
});
</script>