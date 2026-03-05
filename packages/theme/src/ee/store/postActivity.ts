import { reactive } from "vue";
import { defineStore } from "pinia";
import type { IPostActivity } from "@logchimp/types";

export const usePostActivityEEStore = defineStore("postActivityEE", () => {
  const activity = reactive<Record<string, IPostActivity[]>>({});

  function addPostActivity(postId: string, _activity: IPostActivity) {
    const existingActivities = activity[postId] || [];
    if (existingActivities.some((a) => a.id === _activity.id)) return;

    Object.assign(activity, {
      [postId]: [_activity, ...existingActivities],
    });
  }

  function loadPostActivity(postId: string, activities: IPostActivity[]) {
    const existingActivities = activity[postId] || [];
    const existingActivityIds = new Set(existingActivities.map((a) => a.id));
    const newActivities = activities.filter(
      (a) => !existingActivityIds.has(a.id),
    );

    Object.assign(activity, {
      [postId]: [...existingActivities, ...newActivities],
    });
  }

  function resetPostActivity(postId: string) {
    Object.assign(activity, {
      [postId]: [],
    });
  }

  return {
    activity,

    addPostActivity,
    loadPostActivity,
    resetPostActivity,
  };
});
