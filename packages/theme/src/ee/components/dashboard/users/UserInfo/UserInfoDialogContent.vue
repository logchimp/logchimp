<template>
  <DialogContent>
    <template #title>
      User Details
    </template>

    <div class="grid gap-y-4 sm:gap-y-6">
      <div
        :class="[
          'flex items-start justify-between',
          'p-3 border border-(--border-color-default) rounded-lg'
        ]"
      >
        <div class="flex items-center gap-x-3">
          <Avatar
            :src="user.avatar"
            :name="user.username || user.name || ''"
          />
          <div>
            <div class="mb-px">
              <div v-if="user.name" class="text-sm font-medium text-neutral-900">
                {{ user.name }}
              </div>
              <p class="text-xs text-neutral-600">@{{ user.username }}</p>
            </div>
            <CopyableTextField :value="user.email" :minimal="true" />
          </div>
        </div>

        <!-- <span
          class="px-2 py-0.5 text-[11px] font-medium rounded-full bg-purple-100 text-purple-700"
        >
          {{ user.isOwner ? "Owner" : "Member" }}
        </span> -->
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div
          class="p-3 border border-(--border-color-default) rounded-lg"
        >
          <div class="mb-2 flex items-center gap-x-1">
            <AccountInfoIcon aria-hidden="true" class="size-4" />
            <span class="text-sm font-medium text-neutral-700">Account Information</span>
          </div>

          <div class="grid gap-y-3">
            <!-- User ID -->
            <div>
              <div class="text-xs text-neutral-500 mb-1">User ID</div>
              <CopyableTextField :value="user.userId" />
            </div>

            <!-- Joined -->
            <!-- <div>
              <div class="text-xs text-neutral-500 mb-1">Joined</div>
              <div class="text-sm text-neutral-800">
                Created At
              </div>
            </div> -->
          </div>
        </div>

        <div class="p-3 border border-(--border-color-default) rounded-lg">
          <div class="mb-2 flex items-center gap-x-1">
            <ActivityIcon aria-hidden="true" class="size-4" />
            <span class="text-sm font-medium text-neutral-700">Activity Stats</span>
          </div>

          <ul class="grid gap-y-1 text-xs text-neutral-700">
            <li class="flex justify-between px-2 py-1.5 rounded-md bg-neutral-100">
              <div class="font-medium">Posts</div>
              <span class="font-semibold">{{ user.posts }}</span>
            </li>
            <li class="flex justify-between px-2 py-1.5 rounded-md bg-neutral-100">
              <div class="font-medium">Votes</div>
              <span class="font-semibold">{{ user.votes }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="p-3 border border-(--border-color-default) rounded-lg">
        <div class="mb-2 flex items-center gap-x-1">
          <UsersIcon aria-hidden="true" class="size-4" />
          <span class="text-sm font-medium text-neutral-700">User Roles</span>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <RoleBadge
            v-for="role in user.roles"
            :key="role.id"
            :role="role"
          />
        </div>
      </div>
    </div>
  </DialogContent>
</template>

<script setup lang="ts">
import {
  CircleUserRound as AccountInfoIcon,
  Activity as ActivityIcon,
  Users as UsersIcon,
} from "lucide-vue";

import DialogContent from "../../../../../components/ui/Dialog/DialogContent.vue";
import Avatar from "../../../../../components/ui/Avatar/Avatar.vue";
import RoleBadge from "../../../RoleBadge.vue";
import type { UserInfoDialogProps } from "./types";
import CopyableTextField from "../../../../../components/ui/Clipboard/CopyableTextField.vue";

defineProps<UserInfoDialogProps>();
</script>