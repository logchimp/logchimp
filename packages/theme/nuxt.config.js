import "dayjs/plugin/relativeTime";

import packageJSON from "./package.json";

export default {
	srcDir: "packages/theme/",
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

	// DayJS https://www.npmjs.com/package/@nuxtjs/dayjs
	dayjs: {
		plugins: ['relativeTime']
	}
};
