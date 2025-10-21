<template>
  <div class="flex items-center">
    <Td />
    <Td
      :style="{
        minWidth: '500px',
      }"
      class="flex-1"
    >
      {{ role.name }}
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
import type { IRole } from "@logchimp/types";

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