export default {
	srcDir: "frontend/",
	ssr: true,
	target: "server",
	server: {
		port: 8080,
		// default: localhost
		host: "0.0.0.0",
		timing: true
	}
};
