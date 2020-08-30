// packages
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
	{
		path: "/",
		component: require("./layout/HeaderFooter").default,
		children: [
			{
				path: "",
				name: "HomePage",
				component: require("./pages/Home").default
			},
			{
				path: "/settings",
				name: "UserSettings",
				component: require("./pages/user/Settings").default
			},
			{
				path: "/post/:slug",
				component: require("./pages/post/Post").default,
				children: [
					{
						path: "",
						component: require("./pages/post/View").default
					},
					{
						path: "edit",
						name: "PostEdit",
						component: require("./pages/post/Edit").default
					}
				]
			}
		]
	},
	{
		path: "/login",
		name: "Login",
		component: require("./pages/Login").default
	},
	{
		path: "/join",
		name: "Join",
		component: require("./pages/Join").default
	}
];

const router = new VueRouter({
	base: "/",
	mode: "history",
	routes
});

export default router;
