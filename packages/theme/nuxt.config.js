import packageJSON from "./package.json";

export default {
	srcDir: "packages/theme/",
	modules: ["@nuxtjs/axios"],
	router: {
		middleware: ["siteSettings", "isAuthenticated"]
	},
	css: [
		// main SASS file for importing all shared styles
		"~/assets/css/main.sass"
	],
	env: {
		version: packageJSON.version
	}
};
