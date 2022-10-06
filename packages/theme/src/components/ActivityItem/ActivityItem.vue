<template>
  <div class="activity-item-wrapper">
    <avatar :src="activity.author.avatar" :name="activity.author.name" />

    <div class="activity-item-content">
      <h6>{{ activity.author.name }}</h6>
      <p>{{ activity.comment.body }}</p>

      <time
        :datetime="activity.created_at"
				:title="dayjs(activity.created_at).format('dddd, DD MMMM YYYY hh:mm')"
        class="post-date"
      >
        {{ dayjs(activity.created_at).fromNow() }}
      </time>
    </div>
  </div>
</template>

<script setup lang="ts">
// packages
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import Avatar from "../Avatar";

dayjs.extend(relativeTime);

defineProps({
	activity: {
		type: Object,
		required: true
	}
})
</script>

<style lang="sass" src="./ActivityItem.sass" />
