export default {
	srcDir: "frontend/",
	ssr: true,
	target: "server",
	server: {
		port: 8080,
		// default: localhost
		host: "0.0.0.0",
		timing: true
	},
	css: ["@/assets/styles/main.sass"],
	buildModules: ["@nuxtjs/style-resources"],
	styleResources: {
		sass: "@/assets/styles/variables.sass"
	},
	modules: [
		// https://axios.nuxtjs.org
		"@nuxtjs/axios"
	]
};
