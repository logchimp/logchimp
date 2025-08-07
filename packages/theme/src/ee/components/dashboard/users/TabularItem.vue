<template>
  <div class="table-data users-table-user">
    <div class="users-table-user-avatar">
      <avatar :src="user.avatar" :name="user.name || user.username" />
    </div>
    <h6 class="users-table-user-name">
      {{ user.name || user.username }}
    </h6>
  </div>
  <div class="table-data users-table-posts">
    {{ user.posts }}
  </div>
  <div class="table-data users-table-votes">
    {{ user.votes }}
  </div>
  <div v-if="settings.developer_mode" class="table-icon-group boards-table-icons">
    <dropdown-wrapper>
      <template #toggle>
        <div
          :class="[
            'table-data table-data-icon',
            'boards-table-icon-settings',
            'dropdown-menu-icon',
          ]"
        >
          <more-icon />
        </div>
      </template>
      <template #default="dropdown">
        <dropdown v-if="dropdown.active" class="sw">
          <dropdown-item
            @click="useCopyText(user.userId)"
          >
            <template #icon>
              <copy-icon />
            </template>
            Copy ID
          </dropdown-item>
        </dropdown>
      </template>
    </dropdown-wrapper>
  </div>
</template>

<script setup lang="ts">
import { Clipboard as CopyIcon, MoreHorizontal as MoreIcon } from "lucide-vue";
import type { IUser, ISettings } from "@logchimp/types";

import { useCopyText } from "../../../../hooks";
import { Avatar } from "../../../../components/ui/Avatar";
import DropdownWrapper from "../../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../../components/ui/dropdown/DropdownItem.vue";

interface Props {
  user: IUser;
  settings: ISettings;
}

defineProps<Props>();

defineOptions({
  name: "DashboardUsersTabularItem",
});
</script>
