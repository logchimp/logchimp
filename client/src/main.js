import Vue from "vue";
import VueMeta from "vue-meta";

import App from "./App.vue";
import router from "./routes";
import store from "./store";
import dayjs from "./plugins/dayjs";
import "./filters";

import "@/styles/main.sass";

Vue.config.productionTip = false;

Vue.use(VueMeta);
Vue.use(dayjs);

new Vue({
  render: h => h(App),
  router,
  store
}).$mount("#app");
