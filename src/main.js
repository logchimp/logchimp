import Vue from "vue";
import App from "./App.vue";
import router from "./routes";
import moment from "vue-moment";
import store from "./store";

import "@/assets/css/main.sass";

Vue.config.productionTip = false;

Vue.use(moment);

new Vue({
	render: h => h(App),
	router,
	store
}).$mount("#app");
