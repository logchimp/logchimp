import Vue from 'vue'
import App from './App.vue'
import router from "./routes"

import "@/assets/css/main.sass"

Vue.config.productionTip = false

new Vue({
	render: h => h(App),
	router
}).$mount('#app')
