const serverPort = process.env.VUE_APP_SERVER_PORT || 3000;

module.exports = {
	devServer: {
		proxy: {
			'/api': {
				target: `http://localhost:${serverPort}`
			}
		}
	},
	css: {
		loaderOptions: {
			sass: {
				additionalData: `@import "@/styles/variables.sass";`
			}
		}
	}
};
