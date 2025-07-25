import { createRequire } from "module"

const require = createRequire(import.meta.url);
const { mail, generateContent } = require("./index.js")

export {
  mail,
  generateContent
}
