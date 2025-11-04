<template>
  <div class="activity-item-wrapper">
    <avatar :src="activity.author.avatar" :name="activity.author.name" />

    <div class="activity-item-content">
      <h6>{{ activity.author.name }}</h6>
      <p>{{ activity.comment.body }}</p>

      <time
        :datetime="activity.created_at"
        :title="$date(activity.created_at).format('dddd, DD MMMM YYYY hh:mm')"
        class="post-date"
      >
        {{ $date(activity.created_at).from() }}
      </time>
    </div>
  </div>
</template>

<script>
import Avatar from "../Avatar";

export default {
  name: "ActivityItem",
  components: {
    Avatar
  },
  props: {
    activity: {
      type: Object,
      required: true
    }
  }
};
</script>

<style lang="sass" src="./ActivityItem.sass" />
