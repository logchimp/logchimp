import Valkey from "iovalkey";

import { configManager } from "../utils/logchimpConfig";
const config = configManager.getConfig();

let valkey: Valkey | null = null;
const isActive = !!(config.cacheUrl || "").trim();

if (isActive) {
  valkey = new Valkey(config.cacheUrl);
}

export { valkey, isActive };

export default valkey;
