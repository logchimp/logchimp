import Vue from "vue";
import Vuex from "vuex";

// modules
import modules from "./modules";

Vue.use(Vuex);

export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== "production"
});
