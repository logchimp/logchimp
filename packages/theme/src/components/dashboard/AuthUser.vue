<template>
	<div class="pointer rounded-lg px-3 py-2 hover:bg-white/10">
		<div class="grid grid-cols-[2rem_1fr] gap-x-2.5 items-center">
			<avatar
				:src="avatar"
				:name="name || username"
			/>
			<div class="select-none grid grid-cols-1 gap-0.5">
				<p class="truncate font-semibold text-white text-sm">
					{{ name || username }}
				</p>
				<span class="truncate text-xs text-white/50">
					{{ email }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Avatar } from "../ui/Avatar";

defineProps<{
  name: string;
  username: string;
  email: string;
  avatar: string;
}>();
</script>
