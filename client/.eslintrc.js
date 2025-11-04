module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  plugins: ["vue"],
  extends: ["eslint:recommended", "plugin:vue/recommended"],
  rules: {
    "quotes": [2, "double"],
    "semi": [1, "always"],
    "vue/html-indent": [1, 2],
    "indent": [1, 2],
    "comma-dangle": [1, "never"],
    "vue/comma-dangle": [1, "never"],
    "vue/max-attributes-per-line": [
      2,
      {
        singleline: 2
      }
    ]
  },
  overrides: [
    {
      files: ["**/*.spec.js"],
      env: {
        jest: true
      },
      plugins: ["jest"]
    }
  ]
};
