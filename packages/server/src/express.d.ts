import type { Request } from "express";
import type { TEmailVerification, TResetPassword } from "@logchimp/types";

export interface ExpressRequestContext<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  ctx: {
    token?: TEmailVerification | TResetPassword;
  };
}
