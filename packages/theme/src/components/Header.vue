<template>
  <header data-testid="header" class="header bg-(--color-brand-color)">
    <div class="w-full max-w-6xl mx-auto">
      <div class="flex items-center justify-between py-4 px-6">
        <site-branding
          :title="settingsStore.get.title"
          :logo="settingsStore.get.logo"
          text-color="white"
        />

        <select
            v-model="$i18n.locale"
            class="ml-4 px-2 py-1 rounded bg-white text-black text-sm"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="hi">हिन्दी</option>
          </select>

        <nav>
          <HeaderAuthDropdown
            v-if="userStore.user.userId"
          />
          <div v-else class="flex items-center">
            <Button type="primary" href="/login" size="small"> {{ $t("header.login") }} </Button>
            <Button
              v-if="settingsStore.get.allowSignup"
              type="primary"
              :outline="true"
              href="/join"
              size="small"
            >
              {{t("header.createAccount")}}
            </Button>
          </div>
          
        </nav>
      </div>

      <navbar class="mt-2" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useSettingStore } from "../store/settings";
import { useUserStore } from "../store/user";
import { useI18n } from "vue-i18n";

// components
import Navbar from "./Navbar.vue";
import SiteBranding from "./site/SiteBranding.vue";
import Button from "./ui/Button.vue";
import HeaderAuthDropdown from "./HeaderAuthDropdown.vue";

const settingsStore = useSettingStore();
const userStore = useUserStore();
const { t } = useI18n();
</script>
