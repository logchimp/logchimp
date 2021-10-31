import "dayjs/plugin/relativeTime";

import packageJSON from "./package.json";

export default {
	srcDir:
		process.env.LOGCHIMP_THEME_STANDALONE === "true" ? "./" : "packages/theme",
	buildDir: ".out",
	modules: ["@nuxtjs/axios", "@nuxtjs/dayjs"],
	router: {
		middleware: ["siteSettings", "isAuthenticated"]
	},
	css: [
		// main SASS file for importing all shared styles
		"assets/css/main.sass"
	],
	env: {
		version: packageJSON.version
	},

	// Axios https://axios.nuxtjs.org/setup
	axios: {
		// NOTE: a hackish way to set baseUrl only for standalone theme deployment
		...(process.env.LOGCHIMP_THEME_STANDALONE === "true" && {
			baseURL: process.env.LOGCHIMP_SERVER_HOST
		})
	},

	// DayJS https://www.npmjs.com/package/@nuxtjs/dayjs
	dayjs: {
		plugins: ["relativeTime"]
	}
};
