<template>
	<div class="logchimp-poweredby">
		<a
			:href="
				`https://logchimp.codecarrot.net/?utm_source=${source}&utm_medium=powered&company=${siteSettings.title}`
			"
		>
			Powered by LogChimp
		</a>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router"

import { useSettingStore } from "../store/settings"

const route = useRoute();
const { get: siteSettings } = useSettingStore()

const source = computed(() => route.name?.toString())
</script>

<style lang='sass'>
.logchimp-poweredby
	display: flex
	justify-content: center
	margin-top: 2rem

	a
		font-size: 0.875rem
		color: var(--color-gray-70)
</style>
