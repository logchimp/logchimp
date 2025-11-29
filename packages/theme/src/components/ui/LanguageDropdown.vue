<template>
  <DropdownV2 v-if="showLanguageDropdown">
    <template #trigger>
      <DropdownMenuTrigger>
        <button type="button" class="px-3 py-1 text-sm bg-white text-black rounded-lg ">
          <span>{{ currentLanguageLabel }}</span>
        </button>
      </DropdownMenuTrigger>
    </template>

    <DropdownV2Content align="end" side="bottom" :loop="true" :side-offset="8">
      <dropdown-item
        v-for="lang in availableLanguages"
        :key="lang.value"
        @click="setLanguage(lang.value)"
      >
        {{ lang.label }}
        
      </dropdown-item>
    </DropdownV2Content>
  </DropdownV2>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DropdownMenuTrigger } from "reka-ui";
import { useI18n } from "vue-i18n";

// components
import DropdownV2 from "./DropdownV2/Dropdown.vue";
import DropdownV2Content from "./DropdownV2/DropdownContent.vue";
import DropdownItem from "./DropdownV2/DropdownItem.vue";

const { locale } = useI18n();

const availableLanguages = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "hi", label: "हिन्दी" },
];

const currentLanguageLabel = computed(() => {
  const current = availableLanguages.find(
    (lang) => lang.value === locale.value,
  );
  return current ? current.label : "Language";
});

const setLanguage = (lang: string) => {
  locale.value = lang;
};

const showLanguageDropdown = computed(
  () => import.meta.env.VITE_SHOW_LANGUAGE_DROPDOWN === "true",
);
</script>