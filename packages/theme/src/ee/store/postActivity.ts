import { reactive } from "vue";
import { defineStore } from "pinia";
import type { IPostActivity } from "@logchimp/types";

export const usePostActivityEEStore = defineStore("postActivityEE", () => {
  const activityIds = new Set<string>();

  const activity = reactive<Record<string, IPostActivity[]>>({});
  const activityDashboard = reactive<Record<string, IPostActivity[]>>({});

  function addPostActivity(postId: string, _activity: IPostActivity) {
    if (!_activity.comment.is_internal) {
      Object.assign(activity, {
        [postId]: [_activity, ...(activity[postId] || [])],
      });
    }

    Object.assign(activityDashboard, {
      [postId]: [_activity, ...(activityDashboard[postId] || [])],
    });

    activityIds.add(_activity.id);
  }

  function loadPostActivity(postId: string, activities: IPostActivity[]) {
    const activityArr: Array<IPostActivity> = [];
    const dashboardActivityArr: Array<IPostActivity> = [];

    for (let i = 0; i < activities.length; i++) {
      if (activityIds.has(activities[i].id)) continue;

      const _activity = activities[i];
      if (!_activity.comment.is_internal) {
        activityArr.push(_activity);
      }

      dashboardActivityArr.push(_activity);

      activityIds.add(_activity.id);
    }

    Object.assign(activity, {
      [postId]: [...(activity[postId] || []), ...activityArr],
    });
    Object.assign(activityDashboard, {
      [postId]: [...(activityDashboard[postId] || []), ...dashboardActivityArr],
    });
  }

  function resetPostActivity(postId: string) {
    Object.assign(activity, {
      [postId]: [],
    });
    Object.assign(activityDashboard, {
      [postId]: [],
    });
  }

  return {
    activity,
    activityDashboard,

    addPostActivity,
    loadPostActivity,
    resetPostActivity,
  };
});
