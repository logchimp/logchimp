import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import type {
  IApiErrorResponse,
  TCreateRoadmapResponseBody,
  IRoadmapPrivate,
} from "@logchimp/types";

// database
import database from "../../../../database";

// utils
import { generateHexColor } from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = TCreateRoadmapResponseBody | IApiErrorResponse;

export async function create(req: Request, res: Response<ResponseBody>) {
  // @ts-ignore
  const permissions = req.user.permissions;

  const checkPermission = permissions.includes("roadmap:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    // get maximum index value of roadmap
    const roadmapIndex = await database.max("index").from("roadmaps").first();

    const createRoadmap = await database
      .insert({
        id: uuidv4(),
        name: "new roadmap",
        url: `new-roadmap-${nanoid(10)}`,
        color: generateHexColor(),
        index: roadmapIndex.max + 1,
      })
      .into("roadmaps")
      .returning<IRoadmapPrivate[]>([
        "id",
        "name",
        "url",
        "color",
        "index",
        "display",
        "created_at",
      ]);

    const roadmap = createRoadmap[0];

    res.status(201).send({ roadmap });
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
