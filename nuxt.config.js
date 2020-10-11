export default {
	srcDir: "frontend/",
	ssr: true,
	target: "server",
	server: {
		// default: localhost
		host: "0.0.0.0",
		timing: true
	},
	css: ["@/assets/styles/main.sass"],
	buildModules: ["@nuxtjs/style-resources"],
	styleResources: {
		sass: "@/assets/styles/variables.sass"
	},
	plugins: [
		{
			src: "@/plugins/infiniteLoading.js",
			mode: "client"
		}
	],
	serverMiddleware: [
		{
			path: "/",
			handler: "../server"
		}
	],
	modules: [
		// https://axios.nuxtjs.org
		"@nuxtjs/axios",
		"@nuxtjs/universal-storage",
		"nuxt-moment"
	]
};
