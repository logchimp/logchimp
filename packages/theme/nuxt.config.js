import "dayjs/plugin/relativeTime";

import packageJSON from "./package.json";

export default {
	buildDir: ".out",
	modules: ["@nuxtjs/axios", "@nuxtjs/dayjs"],
	router: {
		middleware: ["siteSettings", "isAuthenticated"]
	},
	css: [
		// main SASS file for importing all shared styles
		"~/assets/css/main.sass"
	],
	env: {
		version: packageJSON.version
	},

	// Axios https://axios.nuxtjs.org/setup
	axios: {
		baseURL:
			process.env.LOGCHIMP_THEME_STANDALONE === "true"
				? `http://localhost:${process.env.LOGCHIMP_SERVER_PORT || 80}`
				: ""
	},

	// DayJS https://www.npmjs.com/package/@nuxtjs/dayjs
	dayjs: {
		plugins: ["relativeTime"]
	}
};
