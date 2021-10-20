import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * This plugin and 'dayjs' is only installed as devDependency for running tests
 */
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
