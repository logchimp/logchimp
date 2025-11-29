<template>
  <header data-testid="header" class="header bg-(--color-brand-color)">
    <div class="w-full max-w-6xl mx-auto">
      <div class="flex items-center justify-between gap-x-4 py-4 px-6">
        <site-branding
          :title="settingsStore.get.title"
          :logo="settingsStore.get.logo"
          text-color="white"
        />

       
       <div class="flex items-center gap-5">
        <LanguageDropdown/>
        <nav>
          <HeaderAuthDropdown
            v-if="userStore.user.userId"
          />
          <div v-else class="flex items-center">
            <Button type="primary" href="/login" size="small"> Login </Button>
            <Button
              v-if="settingsStore.get.allowSignup"
              type="primary"
              :outline="true"
              href="/join"
              size="small"
            >
              Create an account
            </Button>
          </div>
        </nav>
        </div>
      </div>

      <navbar class="mt-2" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useSettingStore } from "../store/settings";
import { useUserStore } from "../store/user";

// components
import Navbar from "./Navbar.vue";
import SiteBranding from "./site/SiteBranding.vue";
import Button from "./ui/Button.vue";
import HeaderAuthDropdown from "./HeaderAuthDropdown.vue";
import LanguageDropdown from "./ui/LanguageDropdown.vue";

const settingsStore = useSettingStore();
const userStore = useUserStore();
</script>
