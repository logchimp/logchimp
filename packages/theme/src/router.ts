// packages
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "./store/user";
import { isSiteSetup } from "./modules/site";
import { checkUserDashboardAccess } from "./modules/users";

const routes = [
  {
    path: "/",
    component: () => import("./layout/Viewer.vue"),
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("./pages/Index.vue"),
      },
      {
        path: "boards",
        name: "Boards",
        component: () => import("./pages/boards/Index.vue"),
      },
      {
        path: "boards/:url",
        name: "Board view",
        component: () => import("./pages/boards/_url.vue"),
      },
      {
        path: "roadmaps",
        name: "Roadmaps",
        component: () => import("./pages/Roadmaps.vue"),
      },
      {
        path: "settings",
        name: "User settings",
        component: () => import("./pages/Settings.vue"),
      },
      {
        path: "posts/:slug",
        name: "Posts view",
        component: () => import("./pages/posts/_slug/Index.vue"),
      },
      {
        path: "posts/:slug/edit",
        name: "Posts edit",
        component: () => import("./pages/posts/_slug/Edit.vue"),
      },
    ],
  },
  {
    path: "/setup",
    component: () => import("./layout/Onboarding.vue"),
    redirect: {
      name: "Setup welcome",
    },
    beforeEnter: async (
      _: RouteLocationNormalized,
      __: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
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
        component: () => import("./pages/setup/Welcome.vue"),
      },
      {
        path: "create-account",
        name: "Setup create account",
        component: () => import("./pages/setup/CreateAccount.vue"),
      },
      {
        path: "create-board",
        name: "Setup create board",
        component: () => import("./pages/setup/CreateBoard.vue"),
      },
    ],
  },
  {
    path: "/dashboard",
    component: () => import("./layout/Dashboard.vue"),
    beforeEnter: async (
      _: RouteLocationNormalized,
      __: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
      try {
        const setup = await isSiteSetup();
        // Check for site setup
        if (!setup.data.is_setup) {
          return next({ name: "Setup welcome" });
        }

        // Is user logged in
        const { getUserId } = useUserStore();
        if (!getUserId) {
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
        component: () => import("./pages/dashboard/Index.vue"),
      },
      {
        path: "boards",
        name: "Dashboard boards",
        component: () => import("./pages/dashboard/boards/Index.vue"),
      },
      {
        path: "boards/:url/settings",
        name: "Dashboard boards settings",
        component: () => import("./pages/dashboard/boards/Settings.vue"),
      },
      {
        path: "roadmaps",
        name: "Dashboard roadmaps",
        component: () => import("./pages/dashboard/roadmaps/Index.vue"),
      },
      {
        path: "roadmaps/:url/settings",
        name: "Dashboard roadmaps settings",
        component: () => import("./pages/dashboard/roadmaps/Settings.vue"),
      },
      {
        path: "posts",
        name: "Dashboard posts",
        component: () => import("./pages/dashboard/posts/Index.vue"),
      },
      {
        path: "posts/:slug",
        name: "Dashboard posts settings",
        component: () => import("./pages/dashboard/posts/_slug/Index.vue"),
      },
      {
        path: "users",
        name: "Dashbord users",
        component: () => import("./pages/dashboard/Users.vue"),
      },
      {
        path: "settings",
        redirect: () => {
          return { path: "/dashboard/settings/general" };
        },
      },
      {
        path: "settings/general",
        name: "Dashboard settings",
        component: () => import("./pages/dashboard/settings/General.vue"),
      },
      {
        path: "settings/billing",
        component: () => import("./pages/dashboard/settings/billing.vue"),
      },
      {
        path: "settings/roles",
        name: "Dashbord roles",
        component: () => import("./pages/dashboard/settings/roles/Index.vue"),
      },
      {
        path: "settings/roles/:id/settings",
        name: "Dashbord roles settings",
        component: () =>
          import("./pages/dashboard/settings/roles/Settings.vue"),
      },
      {
        path: "settings/labs",
        name: "Dashbord labs",
        component: () => import("./pages/dashboard/settings/Labs.vue"),
      },
      {
        path: "/dashboard/*",
        name: "Dashboard page not found",
        component: () => import("./pages/pageNotFound.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("./pages/Login.vue"),
  },
  {
    path: "/join",
    name: "Join",
    component: () => import("./pages/Join.vue"),
  },
  {
    path: "/email-verify",
    name: "Email verification",
    component: () => import("./pages/EmailVerify.vue"),
  },
  {
    path: "/password-reset",
    name: "Password reset",
    component: () => import("./pages/passwordReset/Index.vue"),
  },
  {
    path: "/password-reset/confirm",
    name: "Set new password",
    component: () => import("./pages/passwordReset/Confirm.vue"),
  },
  {
    path: "/(.*)",
    name: "Page not found",
    component: () => () => import("./pages/pageNotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
});

export { router };
