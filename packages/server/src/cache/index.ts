import Valkey from "iovalkey";
import logchimpConfig from "../utils/logchimpConfig";
const config = logchimpConfig();

const valkey = new Valkey(config.cache.url);
const isActive = !!(config.cache.url || "").trim();

export { valkey, isActive };

export default valkey;
