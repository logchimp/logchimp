import type { Request } from "express";
import type {
  IRoadmapPrivate,
  TEmailVerification,
  TPermission,
  TResetPassword,
} from "@logchimp/types";
import type { IAuthenticationMiddlewareUser } from "./types";

declare global {
  namespace Express {
    interface Request {
      user: IAuthenticationMiddlewareUser & {
        permissions: TPermission[];
      };
    }
  }
}

export interface ExpressRequestContext<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  ctx: {
    token?: TEmailVerification | TResetPassword;
    roadmap?: IRoadmapPrivate;
  };
}
