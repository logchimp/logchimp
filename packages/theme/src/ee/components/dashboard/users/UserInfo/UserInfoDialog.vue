<template>
  <DialogRoot>
    <DialogTrigger
       :class="['cursor-pointer z-[1] inset-0 absolute outline-none']"
    />

    <DialogPortal>
      <DialogBackdrop :as="DialogOverlay" :is-visible="true" />
      <UserInfoDialogContent :user="user" />
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import {
  DialogRoot,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from "reka-ui";

import type { UserInfoDialogProps } from "./types";
import DialogBackdrop from "../../../../../components/ui/DialogBackdrop.vue";

const UserInfoDialogContent = defineAsyncComponent(
  () => import("./UserInfoDialogContent.vue"),
);

defineProps<UserInfoDialogProps>();
</script>