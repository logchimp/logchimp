import type { Request, Response, NextFunction } from "express";

import type { LicenseGuardOptions } from "../types";

type ControllerHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => void | Promise<void> | Response<ResBody> | Promise<Response<ResBody>>;

interface IApiErrorResponse {
  message: string;
  code: string;
}

type WithLicenseGuardFunction = <
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
>(
  controllerFn: ControllerHandler<P, ResBody, ReqBody, ReqQuery>,
  options: LicenseGuardOptions,
) => (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody | IApiErrorResponse>,
  next: NextFunction,
) => Promise<void>;

let licenseGuardPromise: Promise<WithLicenseGuardFunction> | null = null;

const createFallbackGuard = (): WithLicenseGuardFunction => {
  return <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
    controllerFn: ControllerHandler<P, ResBody, ReqBody, ReqQuery>,
    { requiredPlan, skipHandlerOnFailure }: LicenseGuardOptions,
  ) => {
    return async (
      req: Request<P, ResBody, ReqBody, ReqQuery>,
      res: Response<ResBody | IApiErrorResponse>,
      next: NextFunction,
    ) => {
      if (requiredPlan.includes("free")) {
        await controllerFn(req, res, next);
      } else {
        if (skipHandlerOnFailure) {
          next();
        } else {
          res.status(403).send({
            message: "This feature requires a premium plan",
            code: "PREMIUM_FEATURE_REQUIRED",
          });
        }
      }
    };
  };
};

const getLicenseGuard = async (): Promise<WithLicenseGuardFunction> => {
  if (!licenseGuardPromise) {
    licenseGuardPromise = import("../ee/do-not-remove/middleware/licenseGuard")
      .then((mod) => mod.withLicenseGuard as WithLicenseGuardFunction)
      .catch(() => createFallbackGuard());
  }

  return licenseGuardPromise;
};

const withLicenseGuardWrapper: WithLicenseGuardFunction = <
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
>(
  controllerFn: ControllerHandler<P, ResBody, ReqBody, ReqQuery>,
  options: LicenseGuardOptions,
) => {
  return async (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody | IApiErrorResponse>,
    next: NextFunction,
  ) => {
    try {
      const guard = await getLicenseGuard();
      const guardedHandler = guard(controllerFn, options);
      await guardedHandler(req, res, next);
    } catch (error) {
      console.error("License guard initialization error:", error);
      res.status(500).send({
        message: "Failed to initialize license validation",
        code: "LICENSE_GUARD_ERROR",
      });
    }
  };
};

export { withLicenseGuardWrapper };
export type { LicenseGuardOptions, ControllerHandler, IApiErrorResponse };
