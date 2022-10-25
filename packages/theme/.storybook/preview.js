import Vue from "vue";
import Vuex from "vuex";

import dayjs from "../src/plugins/dayjs";
import "../src/filters";
import "../src/styles/main.sass";

export const parameters = {
  layout: "centered",
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

Vue.use(dayjs);
Vue.use(Vuex);
