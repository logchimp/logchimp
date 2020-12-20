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
				if (response.data.is_setup) {
					return next({ path: "/dashboard" });
				}

				next();
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
				if (!setup.data.is_setup) {
					return next({ name: "Setup welcome" });
				}

				// Is user logged in
				const user = store.getters["user/getUser"];
				if (!user.userId) {
					return next({ name: "Login", query: { redirect: "/dashboard" } });
				}

				// Check user access to dashboard
				const response = await checkUserDashboardAccess();
				if (response.data.access) {
					return next();
				}

				next({ name: "Home" });
			} catch (error) {
				console.error(error);
				next({ name: "Home" });
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
		path: "/email-verify",
		name: "Email verification",
		component: require("./pages/EmailVerify").default
	},
	{
		path: "/password-reset",
		name: "Password reset",
		component: require("./pages/passwordReset/Index").default
	},
	{
		path: "/password-reset/confirm",
		name: "Set new password",
		component: require("./pages/passwordReset/Confirm").default
	}
];

const router = new VueRouter({
	base: "/",
	mode: "history",
	routes
});

export default router;
