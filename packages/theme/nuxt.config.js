module.exports = {
	srcDir: "packages/theme/",
	modules: ["@nuxtjs/axios"],
	router: {
		middleware: ["siteSettings"]
	},
	css: [
		// main SASS file for importing all shared styles
		"~/assets/css/main.sass"
	]
};
