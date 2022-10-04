import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default {
  install: Vue => {
    Object.defineProperties(Vue.prototype, {
      $date: {
        get: () => {
          return dayjs;
        }
      }
    });
    Vue.dayjs = dayjs;
  }
};
