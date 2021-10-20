module.exports = {
  env: {
    test: {
      plugins: ["transform-require-context"],
      presets: ["@babel/preset-env"]
    }
  }
};
