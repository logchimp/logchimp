import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _77acb122 = () => interopDefault(import('../pages/boards/index.vue' /* webpackChunkName: "pages/boards/index" */))
const _2b435316 = () => interopDefault(import('../pages/dashboard/index.vue' /* webpackChunkName: "pages/dashboard/index" */))
const _1a351cbc = () => interopDefault(import('../pages/join.vue' /* webpackChunkName: "pages/join" */))
const _33f05a72 = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _1f991072 = () => interopDefault(import('../pages/password-reset/index.vue' /* webpackChunkName: "pages/password-reset/index" */))
const _e1decc6e = () => interopDefault(import('../pages/roadmaps.vue' /* webpackChunkName: "pages/roadmaps" */))
const _2c5e4a35 = () => interopDefault(import('../pages/settings.vue' /* webpackChunkName: "pages/settings" */))
const _082af20b = () => interopDefault(import('../pages/verify.vue' /* webpackChunkName: "pages/verify" */))
const _26415a86 = () => interopDefault(import('../pages/dashboard/boards/index.vue' /* webpackChunkName: "pages/dashboard/boards/index" */))
const _bf70920e = () => interopDefault(import('../pages/dashboard/posts/index.vue' /* webpackChunkName: "pages/dashboard/posts/index" */))
const _2c1b8c67 = () => interopDefault(import('../pages/dashboard/roadmaps/index.vue' /* webpackChunkName: "pages/dashboard/roadmaps/index" */))
const _630b6a24 = () => interopDefault(import('../pages/dashboard/users/index.vue' /* webpackChunkName: "pages/dashboard/users/index" */))
const _be027540 = () => interopDefault(import('../pages/password-reset/confirm.vue' /* webpackChunkName: "pages/password-reset/confirm" */))
const _146ecc80 = () => interopDefault(import('../pages/setup/create-account.vue' /* webpackChunkName: "pages/setup/create-account" */))
const _9e2cc68e = () => interopDefault(import('../pages/setup/create-board.vue' /* webpackChunkName: "pages/setup/create-board" */))
const _059210a4 = () => interopDefault(import('../pages/setup/welcome.vue' /* webpackChunkName: "pages/setup/welcome" */))
const _50296aa9 = () => interopDefault(import('../pages/dashboard/settings/general.vue' /* webpackChunkName: "pages/dashboard/settings/general" */))
const _155b2595 = () => interopDefault(import('../pages/dashboard/settings/labs.vue' /* webpackChunkName: "pages/dashboard/settings/labs" */))
const _0c729441 = () => interopDefault(import('../pages/dashboard/settings/roles/index.vue' /* webpackChunkName: "pages/dashboard/settings/roles/index" */))
const _162518ae = () => interopDefault(import('../pages/dashboard/settings/roles/_slug/settings.vue' /* webpackChunkName: "pages/dashboard/settings/roles/_slug/settings" */))
const _37a8d374 = () => interopDefault(import('../pages/dashboard/posts/_slug/index.vue' /* webpackChunkName: "pages/dashboard/posts/_slug/index" */))
const _b8ed7ea6 = () => interopDefault(import('../pages/dashboard/boards/_slug/settings.vue' /* webpackChunkName: "pages/dashboard/boards/_slug/settings" */))
const _5ac24643 = () => interopDefault(import('../pages/dashboard/roadmaps/_slug/settings.vue' /* webpackChunkName: "pages/dashboard/roadmaps/_slug/settings" */))
const _3d718990 = () => interopDefault(import('../pages/boards/_url.vue' /* webpackChunkName: "pages/boards/_url" */))
const _78dfac2f = () => interopDefault(import('../pages/posts/_slug/index.vue' /* webpackChunkName: "pages/posts/_slug/index" */))
const _c2a29586 = () => interopDefault(import('../pages/posts/_slug/edit.vue' /* webpackChunkName: "pages/posts/_slug/edit" */))
const _1c602fb0 = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/boards",
    component: _77acb122,
    name: "boards"
  }, {
    path: "/dashboard",
    component: _2b435316,
    name: "dashboard"
  }, {
    path: "/join",
    component: _1a351cbc,
    name: "join"
  }, {
    path: "/login",
    component: _33f05a72,
    name: "login"
  }, {
    path: "/password-reset",
    component: _1f991072,
    name: "password-reset"
  }, {
    path: "/roadmaps",
    component: _e1decc6e,
    name: "roadmaps"
  }, {
    path: "/settings",
    component: _2c5e4a35,
    name: "settings"
  }, {
    path: "/verify",
    component: _082af20b,
    name: "verify"
  }, {
    path: "/dashboard/boards",
    component: _26415a86,
    name: "dashboard-boards"
  }, {
    path: "/dashboard/posts",
    component: _bf70920e,
    name: "dashboard-posts"
  }, {
    path: "/dashboard/roadmaps",
    component: _2c1b8c67,
    name: "dashboard-roadmaps"
  }, {
    path: "/dashboard/users",
    component: _630b6a24,
    name: "dashboard-users"
  }, {
    path: "/password-reset/confirm",
    component: _be027540,
    name: "password-reset-confirm"
  }, {
    path: "/setup/create-account",
    component: _146ecc80,
    name: "setup-create-account"
  }, {
    path: "/setup/create-board",
    component: _9e2cc68e,
    name: "setup-create-board"
  }, {
    path: "/setup/welcome",
    component: _059210a4,
    name: "setup-welcome"
  }, {
    path: "/dashboard/settings/general",
    component: _50296aa9,
    name: "dashboard-settings-general"
  }, {
    path: "/dashboard/settings/labs",
    component: _155b2595,
    name: "dashboard-settings-labs"
  }, {
    path: "/dashboard/settings/roles",
    component: _0c729441,
    name: "dashboard-settings-roles"
  }, {
    path: "/dashboard/settings/roles/:slug/settings",
    component: _162518ae,
    name: "dashboard-settings-roles-slug-settings"
  }, {
    path: "/dashboard/posts/:slug",
    component: _37a8d374,
    name: "dashboard-posts-slug"
  }, {
    path: "/dashboard/boards/:slug/settings",
    component: _b8ed7ea6,
    name: "dashboard-boards-slug-settings"
  }, {
    path: "/dashboard/roadmaps/:slug/settings",
    component: _5ac24643,
    name: "dashboard-roadmaps-slug-settings"
  }, {
    path: "/boards/:url",
    component: _3d718990,
    name: "boards-url"
  }, {
    path: "/posts/:slug",
    component: _78dfac2f,
    name: "posts-slug"
  }, {
    path: "/posts/:slug?/edit",
    component: _c2a29586,
    name: "posts-slug-edit"
  }, {
    path: "/",
    component: _1c602fb0,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
