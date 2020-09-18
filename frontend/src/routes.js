// packages
import Vue from "vue";
import VueRouter from "vue-router";
import axios from "axios";

import store from "./store";

Vue.use(VueRouter);

const routes = [
	{
		path: "/",
		component: require("./layout/HeaderFooter").default,
		children: [
			{
				path: "",
				name: "Homepage",
				component: require("./pages/Homepage").default
			},
			{
				path: "boards",
				component: require("./pages/board/Boards").default
			},
			{
				path: "board/:slug",
				component: require("./pages/board/Board").default
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
		path: "/setup",
		component: require("./layout/Onboarding").default,
		beforeEnter: (to, from, next) => {
			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/auth/isSetup`)
				.then(response => {
					if (response.data.isSetup) {
						next({ path: "/dashboard" });
					} else {
						if (to.fullPath === "/setup/" || to.fullPath === "/setup") {
							next({ path: "/setup/welcome" });
						} else {
							next();
						}
					}
				})
				.catch(error => {
					console.error(error);
					next({ path: "/" });
				});
		},
		children: [
			{
				path: "welcome",
				component: require("./pages/setup/Welcome").default
			},
			{
				path: "create-account",
				component: require("./pages/setup/Account").default
			},
			{
				path: "create-board",
				component: require("./pages/setup/Board").default
			}
		]
	},
	{
		path: "/dashboard",
		component: require("./layout/Dashboard").default,
		beforeEnter: (to, from, next) => {
			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/auth/isSetup`)
				.then(response => {
					if (response.data.isSetup) {
						const user = store.getters["user/getUser"];
						if (user.userId) {
							axios
								.get(
									`${process.env.VUE_APP_SEVER_URL}/api/v1/user/accessDashboard/${user.userId}`
								)
								.then(response => {
									if (response.data.access) {
										next();
									} else {
										next({ path: "/" });
									}
								})
								.catch(error => {
									console.error(error);
									next({ path: "/" });
								});
						} else {
							next({ path: "/login", query: { redirect: "/dashboard" } });
						}
					} else {
						next({ path: "/setup/welcome" });
					}
				})
				.catch(error => {
					console.error(error);
				});
		},
		children: [
			{
				path: "",
				component: require("./pages/dashboard/Overview").default
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
