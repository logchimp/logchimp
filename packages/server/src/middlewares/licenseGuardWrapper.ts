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

let licenseGuardCache: WithLicenseGuardFunction | null = null;
let loadAttempted = false;

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
        controllerFn(req, res, next);
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
  if (licenseGuardCache) {
    return licenseGuardCache;
  }

  if (!loadAttempted) {
    loadAttempted = true;
    try {
      const licenseModule = await import(
        "../ee/do-not-remove/middleware/licenseGuard"
      );
      licenseGuardCache =
        licenseModule.withLicenseGuard as WithLicenseGuardFunction;
    } catch (_) {
      licenseGuardCache = createFallbackGuard();
    }
  }

  return licenseGuardCache;
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
