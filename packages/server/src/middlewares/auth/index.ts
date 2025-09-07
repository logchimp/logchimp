import { authRequired as authenticate } from "./authRequired";
import { authorize } from "../authorize";

export const authRequired = [authenticate, authorize];
