import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";
import { JSDOM } from "jsdom";
import { isHexColor, isURL } from "validator";
import createDOMPurify from "dompurify";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { workspaceRepository } from "../../repository/workspace";

// cache
import * as cache from "../../cache";
import { CACHE_KEYS } from "../../cache/keys";

const workspaceRepo = new workspaceRepository();

type ResponseBody =
  | components["schemas"]["UpdateSiteSettingsResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function update(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["UpdateSiteSettingsRequestBody"]
  >,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;

  const checkPermission = permissions.find(
    (item) => item === "settings:update",
  );
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const { title, description, allowSignup, googleAnalyticsId, developer_mode } =
    req.body;

  let logo: string | null | undefined;
  if ("logo" in req.body) {
    const _logo = req.body.logo;

    if (_logo === null || _logo === "") {
      logo = null;
    } else {
      const _sanitized = (sanitizeUrl(req.body?.logo.trim()) || "").trim();

      if (!isURL(_sanitized)) {
        res.status(400).send({
          message: "Invalid Logo URL",
          code: "INVALID_LOGO_URL",
        });
        return;
      }

      if (_sanitized.length > 255) {
        res.status(400).send({
          message: "Logo URL is too long",
          code: "LOGO_URL_TOO_LONG",
        });
        return;
      }

      logo = _sanitized;
    }
  }

  let accentColor: string | null | undefined;
  if ("accentColor" in req.body) {
    const _accentColor = req.body.accentColor;

    if (_accentColor === null || _accentColor === "") {
      accentColor = null;
    } else {
      if (!isHexColor(_accentColor)) {
        res.status(400).send({
          message: "Invalid accent color",
          code: "INVALID_ACCENT_COLOR",
        });
        return;
      }

      accentColor = _accentColor;
    }
  }

  // Validate: at least one of site name or logo must be provided when both are sent
  if ("title" in req.body || "logo" in req.body) {
    try {
      const currentSettings = await workspaceRepo.GetSettings();

      const title = (
        "title" in req.body
          ? (req.body.title ?? "")
          : (currentSettings?.title ?? "")
      ).trim();
      const effectiveLogo = (
        "logo" in req.body ? (logo ?? "") : (currentSettings?.logo ?? "")
      ).trim();

      if (!title && !effectiveLogo) {
        return res.status(400).send({
          message: "Either a site name or logo URL is required",
          code: "SITE_NAME_OR_LOGO_REQUIRED",
        });
      }
    } catch (err) {
      logger.log({ level: "error", message: err });
      return res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
    }
  }

  try {
    const updateSettings = await database
      .update({
        title,
        description,
        logo,
        icon: logo,
        allowSignup,
        accentColor,
        googleAnalyticsId,
        developer_mode,
      })
      .from("settings")
      .returning(["*", database.raw("labs::json as labs")]);

    const settings = updateSettings[0];

    if (cache.isActive) {
      try {
        await cache.valkey.del(CACHE_KEYS.SITE_SETTINGS);
      } catch (err) {
        logger.error({ message: err });
      }
    }

    res.status(200).send({
      settings,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

function sanitizeUrl(value: string): string | null {
  // Create a DOM window for DOMPurify to use
  const window = new JSDOM("").window;
  // @ts-expect-error
  const DOMPurify = createDOMPurify(window as unknown);

  const imgDiv = `<img src="${value}">`;

  // Sanitize the HTML using DOMPurify
  const sanitized = (
    DOMPurify.sanitize(imgDiv, {
      ALLOWED_TAGS: ["img"],
      ALLOWED_ATTR: ["src"],
      ALLOW_DATA_ATTR: false,
    }) || ""
  ).trim();

  const url = sanitized.substring(10, sanitized.length - 2);
  return url || null;
}
