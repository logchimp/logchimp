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
				name: "Home",
				component: require("./pages/Index").default
			},
			{
				path: "boards",
				name: "Boards",
				component: require("./pages/Boards").default
			},
			{
				path: "board/:url",
				name: "Board view",
				component: require("./pages/board/_url").default
			},
			{
				path: "settings",
				name: "User settings",
				component: require("./pages/Settings").default
			},
			{
				path: "/post/:slug",
				name: "Post view",
				component: require("./pages/post/_slug/Index").default
			},
			{
				path: "/post/:slug/edit",
				name: "Post edit",
				component: require("./pages/post/_slug/Edit").default
			}
		]
	},
	{
		path: "/setup",
		component: require("./layout/Onboarding").default,
		redirect: {
			name: "Setup welcome"
		},
		beforeEnter: (to, from, next) => {
			axios
				.get("/api/v1/auth/isSetup")
				.then(response => {
					if (response.data.isSetup) {
						next({ path: "/dashboard" });
					} else {
						next();
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
				.get("/api/v1/auth/isSetup")
				.then(response => {
					if (response.data.isSetup) {
						const user = store.getters["user/getUser"];
						if (user.userId) {
							axios
								.get(
									`/api/v1/user/accessDashboard/${user.userId}`
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
			},
			{
				path: "boards",
				component: require("./pages/dashboard/board/DashboardBoards").default
			},
			{
				path: "create-board",
				component: require("./pages/dashboard/board/DashboardCreateBoard")
					.default
			},
			{
				path: "board/:slug",
				component: require("./pages/dashboard/board/DashboardBoard").default
			},
			{
				path: "posts",
				component: require("./pages/dashboard/post/DashboardPosts").default
			},
			{
				path: "post/:slug",
				components: require("./pages/dashboard/post/DashboardPostView")
			},
			{
				path: "users",
				component: require("./pages/dashboard/user/DashboardUsers").default
			},
			{
				path: "settings",
				component: require("./pages/dashboard/DashboardSettings").default
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
