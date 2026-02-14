<template>
  <Table :disableDividers="requireUpgrade">
    <template #header>
      <Td :head="true" />
      <Td
        :head="true"
        :style="{
          minWidth: '500px',
        }"
        class="flex-1"
      >
        Name
      </Td>
      <Td
        :head="true"
        :style="{
          width: '40px',
        }"
      />
    </template>

    <template v-if="requireUpgrade">
      <div class="pointer-events-none select-none divide-y divide-neutral-200 relative" aria-hidden="true">
        <Tr
          v-for="role in EXAMPLE_ROLES_DATA"
          :key="role.id"
        >
          <TabularItem :role="role" />
        </Tr>
        <div class="absolute inset-0 bg-linear-to-t from-white to-white/30" />
      </div>

      <EmptyScreen
        title="Roles and Permissions"
        description="Want to have more control in your organisation? Upgrade to Enterprise plan to access advanced features and manage your team more efficiently."
        learnMore="https://docs.logchimp.codecarrot.net/guide/dashboard/role-permission"
        :border="false"
        :icon="ShieldIcon"
        padding-y="pt-0 pb-7 lg:pb-20"
      >
        <template #button>
          <Button type="primary" href="/dashboard/settings/billing">
            Upgrade
          </Button>
        </template>
      </EmptyScreen>
    </template>
    <template v-else>
      <Tr
        v-for="role in dashboardRoles.roles"
        :key="role.id"
      >
        <TabularItem :role="role" />
      </Tr>
    </template>

    <template #infinite-loader v-if="!requireUpgrade">
      <infinite-scroll
        :on-infinite="dashboardRoles.fetchRoles"
        :state="dashboardRoles.state"
      />
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ShieldIcon } from "lucide-vue";

import { useDashboardRoles } from "../../../store/dashboard/roles";
import Table from "../../../../components/ui/Table/Table.vue";
import TabularItem from "./TabularItem/TabularItem.vue";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";
import Td from "../../../../components/ui/Table/Td.vue";
import { EXAMPLE_ROLES_DATA } from "./example-data.ts";
import EmptyScreen from "../../../../components/EmptyScreen.vue";
import Button from "../../../../components/ui/Button.vue";

const dashboardRoles = useDashboardRoles();
const requireUpgrade = computed(
  () => dashboardRoles.error === "LICENSE_INSUFFICIENT_TIER",
);

defineOptions({
  name: "DashboardRolesTabularView",
});
</script>
