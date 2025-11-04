const serverUrl = process.env.VUE_APP_SERVER_URL || "http://localhost:3000";

module.exports = {
  devServer: {
    disableHostCheck: process.env.IS_GITPOD ? true : false,
    proxy: {
      "/api": {
        target: serverUrl
      }
    }
  }
};
