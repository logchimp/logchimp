import type { Request, Response } from "express";
import type {
  IRoadmapPrivate,
  IApiErrorResponse,
  ISortRoadmapRequestBody,
  TPermission,
  TSortRoadmapResponseBody,
} from "@logchimp/types";
import { LexoRank } from "lexorank";
import * as v from "valibot";

import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = TSortRoadmapResponseBody | IApiErrorResponse;

type TRoadmapIndex = { index: string };

const bodySchema = v.pipe(
  v.object({
    id: v.message(
      v.pipe(v.optional(v.string(), ""), v.uuid()),
      "ROADMAP_ID_INVALID",
    ),
    prevRoadmapId: v.optional(v.pipe(v.string(), v.uuid("ROADMAP_ID_INVALID"))),
    nextRoadmapId: v.optional(v.pipe(v.string(), v.uuid("ROADMAP_ID_INVALID"))),
  }),
  v.check(
    (input) =>
      input.prevRoadmapId !== undefined || input.nextRoadmapId !== undefined,
    "PREV_ROADMAP_ID_OR_NEXT_ROADMAP_ID_REQUIRED",
  ),
  v.check(
    (input) =>
      input.prevRoadmapId !== input.id && input.nextRoadmapId !== input.id,
    "ROADMAP_ID_INVALID",
  ),
);

const schemaBodyErrorMap = {
  ROADMAP_ID_INVALID: error.api.roadmaps.idInvalid,
  PREV_ROADMAP_ID_OR_NEXT_ROADMAP_ID_REQUIRED: error.api.roadmaps.idMissing,
};

export async function sort(
  req: Request<unknown, unknown, ISortRoadmapRequestBody>,
  res: Response<ResponseBody>,
) {
  const { id, prevRoadmapId, nextRoadmapId } = req.body;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("roadmap:update");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const body = v.safeParse(bodySchema, req.body);
  if (!body.success) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: body.issues.map((issue) => ({
        ...issue,
        message: schemaBodyErrorMap[issue.message]
          ? schemaBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
  }

  try {
    await database.transaction(async (trx) => {
      const getRoadmapId = await trx("roadmaps")
        .select("id", "index")
        .whereIn("id", [prevRoadmapId, nextRoadmapId].filter(Boolean));

      const prevRoadmap: TRoadmapIndex = getRoadmapId.find(
        (r) => r.id === prevRoadmapId,
      );
      const nextRoadmap: TRoadmapIndex = getRoadmapId.find(
        (r) => r.id === nextRoadmapId,
      );

      if (!prevRoadmap && !nextRoadmap) {
        return res.status(400).send({
          message: error.api.roadmaps.roadmapNotFound,
          code: "ROADMAP_NOT_FOUND",
        });
      }

      if (prevRoadmap && nextRoadmap) {
        if (prevRoadmap.index >= nextRoadmap.index) {
          return res.status(400).send({
            message: error.api.roadmaps.neighbourInvalid,
            code: "ROADMAP_NEIGHBOUR_INVALID",
          });
        }

        const roadmapsBetween = await trx("roadmaps")
          .where("index", ">", prevRoadmap.index)
          .andWhere("index", "<", nextRoadmap.index)
          .limit(1)
          .select("id");

        if (roadmapsBetween.length) {
          return res.status(400).send({
            message: error.api.roadmaps.neighbourInvalid,
            code: "ROADMAP_NEIGHBOUR_INVALID",
          });
        }
      }

      const newIndex = calculateRankIndex(prevRoadmap, nextRoadmap);
      if (!newIndex) {
        return res.status(500).send({
          message: error.general.serverError,
          code: "SERVER_ERROR",
        });
      }

      await trx
        .update({
          index: newIndex,
        })
        .from("roadmaps")
        .where({
          id,
        });

      res.status(200).send({
        index: newIndex,
      });
    });
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

function calculateRankIndex(
  prevRoadmap: TRoadmapIndex,
  nextRoadmap: TRoadmapIndex,
): string {
  try {
    if (!nextRoadmap) {
      const prevRoadmapIndex: LexoRank = prevRoadmap.index
        ? LexoRank.parse(prevRoadmap.index)
        : LexoRank.middle();

      return prevRoadmapIndex.genNext().toString();
    } else if (!prevRoadmap) {
      const nextRoadmapIndex = nextRoadmap.index
        ? LexoRank.parse(nextRoadmap.index)
        : LexoRank.middle();

      return nextRoadmapIndex.genPrev().toString();
    } else {
      const prevIndex = prevRoadmap.index
        ? LexoRank.parse(prevRoadmap.index)
        : LexoRank.middle();
      const nextIndex = nextRoadmap.index
        ? LexoRank.parse(nextRoadmap.index)
        : LexoRank.middle().genNext();

      return prevIndex.between(nextIndex).toString();
    }
  } catch {
    return "";
  }
}
