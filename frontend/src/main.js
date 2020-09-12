import Vue from "vue";
import moment from "vue-moment";

import App from "./App.vue";
import router from "./routes";
import store from "./store";

import "@/styles/main.sass";

Vue.config.productionTip = false;

Vue.use(moment);

new Vue({
	render: h => h(App),
	router,
	store
}).$mount("#app");
