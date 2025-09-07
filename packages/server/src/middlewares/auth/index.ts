import { authRequired as authenticate } from "./authRequired";
import { authorize } from "./authorize";

export { authOptional } from "./authOptional";
export const authRequired = [authenticate, authorize];
