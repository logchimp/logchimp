import { reactive } from "vue";
import { defineStore } from "pinia";
import type { IPostActivity } from "@logchimp/types";

export const usePostActivityEEStore = defineStore("postActivityEE", () => {
  const activity = reactive<Record<string, IPostActivity[]>>({});

  function addPostActivity(postId: string, _activity: IPostActivity) {
    Object.assign(activity, {
      [postId]: [_activity, ...(activity[postId] || [])],
    });
  }

  function loadPostActivity(postId: string, activities: IPostActivity[]) {
    Object.assign(activity, {
      [postId]: [...(activity[postId] || []), ...activities],
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
