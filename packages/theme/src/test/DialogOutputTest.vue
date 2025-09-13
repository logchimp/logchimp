<template>
    <div class="p-6">
        <UserInfoDialog userId="1" />
    </div>
    <Dropdown>
        <template #trigger>
            <DropdownMenuTrigger asChild>
                <p>user info</p>
            </DropdownMenuTrigger>
        </template>
        <!-- Dropdown Content -->
        <DropdownContent>
            <DropdownItem @click="onProfileClick">Profile</DropdownItem>
            <DropdownItem @click="onSettingsClick">Settings</DropdownItem>
            <DropdownItem>
                <div class="p-6">
                    <UserInfoDialog userId="1" />
                </div>
            </DropdownItem>
            <DropdownSeparator />
            <CheckboxItem v-model="isChecked">Enable Option</CheckboxItem>
        </DropdownContent>
    </Dropdown>
    <div>
  </div>
</template>

<script setup lang="ts">
import { DropdownMenuTrigger } from "reka-ui";

import UserInfoDialog from "../ee/components/dashboard/users/UserInfoDialog.vue";
import Dropdown from '../../src/components/ui/DropdownV2/Dropdown.vue'
import DropdownContent from '../../src/components/ui/DropdownV2/DropdownContent.vue'
import DropdownItem from '../../src/components/ui/DropdownV2/DropdownItem.vue'
import DropdownSeparator from '../../src/components/ui/DropdownV2/DropdownSeparator.vue'
import CheckboxItem from '../../src/components/ui/DropdownV2/CheckboxItem.vue'
import { ref } from 'vue'

const isChecked = ref(false)

function onProfileClick() {
    console.log("Profile clicked")
}
function onSettingsClick() {
    console.log("Settings clicked")
}

</script>