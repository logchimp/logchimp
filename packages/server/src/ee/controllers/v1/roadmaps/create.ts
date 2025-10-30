import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { LexoRank } from "lexorank";
import type {
  IApiErrorResponse,
  TCreateRoadmapResponseBody,
  IRoadmapPrivate,
  TPermission,
  ICreateRoadmapRequestBody,
} from "@logchimp/types";

// database
import database from "../../../../database";

// utils
import {
  generateHexColor,
  generateNanoID as nanoid,
} from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = TCreateRoadmapResponseBody | IApiErrorResponse;

export async function create(
  req: Request<unknown, unknown, ICreateRoadmapRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("roadmap:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  let name: string | undefined;
  if (req.body?.name) {
    // TODO: length check
    name = req.body.name.trim();
  }

  try {
    const lastRoadmap = await database
      .select("index")
      .from("roadmaps")
      .orderBy("index", "desc")
      .first();

    let nextIndex: string;

    if (!lastRoadmap) {
      nextIndex = LexoRank.middle().toString();
    } else {
      const prevLexoRank = LexoRank.parse(lastRoadmap.index);
      nextIndex = prevLexoRank.genNext().toString();
    }

    const createRoadmap = await database
      .insert({
        id: uuidv4(),
        name: name || "new roadmap",
        url: `new-roadmap-${nanoid(10)}`,
        color: generateHexColor(),
        index: nextIndex,
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
