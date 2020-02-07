// packages
import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

const routes = [
	{
		path: "/",
		name: "HomePage",
		component: require("./pages/Home").default
	},
	{
		path: '/post/:slug',
		name: "PostView",
		component: require("./pages/post/View").default
	}
]

const router = new VueRouter({
	base: "/",
	mode: "history",
	routes
})

export default router
