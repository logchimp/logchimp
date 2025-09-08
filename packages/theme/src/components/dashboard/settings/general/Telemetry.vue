<template>
  <div class="form-section" v-if="showTelemetryForm">
    <h6 class="form-section-title">Telemetry</h6>

    <div class="border border-neutral-200 rounded-lg px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-x-3">
        <div aria-hidden="true" class="rounded-full bg-neutral-200 p-3">
          <TelescopeIcon class="stroke-neutral-700" />
        </div>
        <div>
          <div class="font-medium">
            Allow LogChimp to collect anonymous usage events
          </div>
          <p class="text-sm text-neutral-700/70">
            We collect usage events without any PII to analyse and improve LogChimp.
          </p>
        </div>
      </div>

      <Toggle v-model="telemetry" disabled />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { TelescopeIcon } from "lucide-vue";
import Toggle from "../../../ui/input/Toggle.vue";

const telemetry = ref(false);
const showTelemetryForm = computed(
  () => import.meta.env.VITE_SHOW_TELEMETRY_FORM === "true",
);

defineOptions({
  name: "SettingsTelemetryForm",
});
</script>


