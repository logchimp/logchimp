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
        component: require("./pages/boards/Index").default
      },
      {
        path: "boards/:url",
        name: "Board view",
        component: require("./pages/boards/_url").default
      },
      {
        path: "roadmaps",
        name: "Roadmaps",
        component: require("./pages/Roadmaps").default
      },
      {
        path: "settings",
        name: "User settings",
        component: require("./pages/Settings").default
      },
      {
        path: "posts/:slug",
        name: "Posts view",
        component: require("./pages/posts/_slug/Index").default
      },
      {
        path: "posts/:slug/edit",
        name: "Posts edit",
        component: require("./pages/posts/_slug/Edit").default
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
        component: require("./pages/dashboard/boards/Index").default
      },
      {
        path: "boards/:url/settings",
        name: "Dashboard boards settings",
        component: require("./pages/dashboard/boards/Settings").default
      },
      {
        path: "roadmaps",
        name: "Dashboard roadmaps",
        component: require("./pages/dashboard/roadmaps/Index").default
      },
      {
        path: "roadmaps/:url/settings",
        name: "Dashboard roadmaps settings",
        component: require("./pages/dashboard/roadmaps/Settings").default
      },
      {
        path: "posts",
        name: "Dashboard posts",
        component: require("./pages/dashboard/posts/Index").default
      },
      {
        path: "posts/:slug",
        name: "Dashboard posts settings",
        components: require("./pages/dashboard/posts/_slug/Index")
      },
      {
        path: "users",
        name: "Dashbord users",
        component: require("./pages/dashboard/Users").default
      },
      {
        path: "settings/general",
        name: "Dashboard settings",
        component: require("./pages/dashboard/settings/General").default
      },
      {
        path: "settings/roles",
        name: "Dashbord roles",
        component: require("./pages/dashboard/settings/roles/Index").default
      },
      {
        path: "settings/roles/:id/settings",
        name: "Dashbord roles settings",
        component: require("./pages/dashboard/settings/roles/Settings").default
      },
      {
        path: "settings/labs",
        name: "Dashbord labs",
        component: require("./pages/dashboard/settings/Labs").default
      },
      {
        path: "/dashboard/*",
        name: "Dashboard page not found",
        component: require("./pages/pageNotFound").default
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
  },
  {
    path: "*",
    name: "Page not found",
    component: require("./pages/pageNotFound").default
  }
];

const router = new VueRouter({
  base: "/",
  mode: "history",
  routes
});

export default router;
