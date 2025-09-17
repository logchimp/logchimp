import Valkey from "iovalkey";
import logchimpConfig from "../utils/logchimpConfig";
const config = logchimpConfig();

let valkey: Valkey | null = null;
const isActive = !!(config.cache.url || "").trim();

if (isActive) {
  valkey = new Valkey(config.cache.url);
}

export { valkey, isActive };

export default valkey;
