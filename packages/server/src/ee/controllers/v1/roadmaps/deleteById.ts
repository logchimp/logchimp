import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";

import database from "../../../../database";

// utils
import { validUUID } from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import * as cache from "../../../../cache";

type ResponseBody = components["schemas"]["GenericAPIErrorResponseBody"];

export async function deleteById(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["DeleteRoadmapRequestBody"]
  >,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;

  const id = validUUID(req.body.id);

  const checkPermission = permissions.includes("roadmap:destroy");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  try {
    await database.delete().from("roadmaps").where({
      id: id,
    });

    if (cache.isActive) {
      try {
        await cache.valkey.del(`roadmap:public:${id}`);
      } catch (e) {
        logger.error({
          message: e,
        });
      }
    }

    res.sendStatus(204);
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
