import Vue from "vue";
import moment from "vue-moment";
import infiniteLoading from "vue-infinite-loading";

import App from "./App.vue";
import router from "./routes";
import store from "./store";

import "@/assets/css/main.sass";

Vue.config.productionTip = false;

Vue.use(moment);
Vue.use(infiniteLoading);

new Vue({
	render: h => h(App),
	router,
	store
}).$mount("#app");
