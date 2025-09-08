import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IUpdateSiteSettingsRequestBody,
  TPermission,
  TUpdateSiteSettingsResponseBody,
} from "@logchimp/types";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = TUpdateSiteSettingsResponseBody | IApiErrorResponse;

export async function update(
  req: Request<unknown, unknown, IUpdateSiteSettingsRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.find(
    (item) => item === "settings:update",
  );
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const {
    title,
    description,
    allowSignup,
    accentColor,
    googleAnalyticsId,
    developer_mode,
  } = req.body;

  let logo: string;
  if (req.body?.logo) {
    logo = sanitizeLogo(req.body?.logo);
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

function sanitizeLogo(value: string): string | null {
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
