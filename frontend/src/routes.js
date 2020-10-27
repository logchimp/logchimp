// packages
import Vue from "vue";
import VueRouter from "vue-router";

import store from "./store";
import { isSiteSetup } from "./modules/site";
import { checkUserDashboardAccess } from "./modules/users";

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
		beforeEnter: async (to, from, next) => {
			try {
				const response = await isSiteSetup();
				if (response.data.isSetup) {
					next({ path: "/dashboard" });
				} else {
					next();
				}
			} catch (error) {
				console.error(error);
				next({ name: "Home" });
			}
		},
		children: [
			{
				path: "welcome",
				name: "Setup welcome",
				component: require("./pages/setup/Index").default
			},
			{
				path: "create-account",
				name: "Setup create account",
				component: require("./pages/setup/Account").default
			},
			{
				path: "create-board",
				name: "Setup create board",
				component: require("./pages/setup/Board").default
			}
		]
	},
	{
		path: "/dashboard",
		component: require("./layout/Dashboard").default,
		beforeEnter: async (to, from, next) => {
			try {
				const setup = await isSiteSetup();
				// Check for site setup
				if (!setup.data.isSetup) {
					next({ name: "Setup welcome" });
					return;
				}

				// Is user logged in
				const user = store.getters["user/getUser"];
				if (!user.userId) {
					next({ name: "Login", query: { redirect: "/dashboard" } });
					return;
				}

				// Check user access to dashboard
				const access = await checkUserDashboardAccess(user.userId);
				if (access.data.access) {
					next();
				} else {
					next({ name: "Home" });
				}
			} catch (error) {
				console.error(error);
			}
		},
		children: [
			{
				path: "",
				name: "Dashboard overview",
				component: require("./pages/dashboard/Index").default
			},
			{
				path: "boards",
				name: "Dashboard boards",
				component: require("./pages/dashboard/Boards").default
			},
			{
				path: "boards/create",
				name: "Dashboard board create",
				component: require("./pages/dashboard/boards/Create").default
			},
			{
				path: "board/:url",
				name: "Dashboard board view",
				component: require("./pages/dashboard/board/_url/Index").default
			},
			{
				path: "posts",
				name: "Dashboard posts",
				component: require("./pages/dashboard/Posts").default
			},
			{
				path: "post/:slug",
				name: "Dashboard post view",
				components: require("./pages/dashboard/post/_slug/Index")
			},
			{
				path: "users",
				name: "Dashbord users",
				component: require("./pages/dashboard/Users").default
			},
			{
				path: "settings",
				name: "Dashboard settings",
				component: require("./pages/dashboard/Settings").default
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
	},
	{
		path: "/forget",
		name: "Forget",
		component: require("./pages/forget").default
	},
	{
		path: "/forget/password/:token",
		name: "SetNewPassword",
		component: require("./pages/forget/password").default
	}
];

const router = new VueRouter({
	base: "/",
	mode: "history",
	routes
});

export default router;
