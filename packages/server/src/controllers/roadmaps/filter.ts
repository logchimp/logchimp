import { z } from "zod";
import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IPaginatedRoadmapsResponse,
  IRoadmapPrivate,
} from "@logchimp/types";
import database from "../../database";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { getUserFromRequest } from "../../utils/getUserFromRequest";
import { computePermissions } from "../../utils/computePermissions";
import { GET_ROADMAPS_FILTER_COUNT } from "../../constants";

const querySchema = z.object({
  first: z.coerce
    .number()
    .min(1)
    .max(GET_ROADMAPS_FILTER_COUNT)
    .default(GET_ROADMAPS_FILTER_COUNT),
  after: z.string().uuid().optional(),
});

type ResponseBody = IPaginatedRoadmapsResponse | IApiErrorResponse;

export async function filter(req: Request, res: Response<ResponseBody>) {
  try {
    const { first, after } = querySchema.parse(req.query);

    const data = await getRoadmapQuery(first, after);
    const dataLength = data.length;

    const startCursor = data.length > 0 ? String(data[0].id) : null;
    const endCursor = data.length > 0 ? String(data[data.length - 1].id) : null;

    let totalCount: number | null = null;
    let totalPages: number | null = null;
    let currentPage = 1;
    let hasNextPage = false;

    const metadataResults = await getRoadmapMetadata(after);
    if (metadataResults) {
      totalCount = metadataResults.totalCount;
      totalPages = Math.ceil(metadataResults.totalCount / first);
      hasNextPage = metadataResults.remainingResultsCount - first > 0;

      if (after) {
        const seenResults = totalCount - metadataResults.remainingResultsCount;
        currentPage = Math.floor(seenResults / first) + 1;
      }
    }

    res.status(200).json({
      results: data,
      roadmaps: data,
      page_info: {
        count: dataLength,
        current_page: currentPage,
        has_next_page: hasNextPage,
        end_cursor: endCursor,
        start_cursor: startCursor,
      },
      total_pages: totalPages,
      total_count: totalCount,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
        errors: err.issues,
      });
    }

    logger.error({ message: err });
    res.status(500).json({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

function getRoadmapQuery(first: number, after?: string) {
  let query = database<IRoadmapPrivate>("roadmaps")
    .select("id", "name", "url", "color", "display", "index", "created_at")
    .orderBy("index", "asc")
    .limit(first);

  if (after) {
    query = query
      .where(
        "index",
        ">=",
        database("roadmaps").select("index").where("id", "=", after),
      )
      .offset(1);
  }

  return query;
}

async function getRoadmapMetadata(after?: string) {
  return database.transaction(async (trx) => {
    // Total count
    const totalCountResult = await trx("roadmaps").count("* as count");

    // Has next page
    let hasNextPageSubquery = database("roadmaps").as("next");
    if (after) {
      hasNextPageSubquery = hasNextPageSubquery
        .where(
          "index",
          ">=",
          database("roadmaps").select("index").where("id", "=", after),
        )
        .offset(1);
    }
    const hasNextPageResult = await trx
      .count<{ count: string }[]>({ count: "*" })
      .from(hasNextPageSubquery);

    const totalCount = Number.parseInt(String(totalCountResult[0].count), 10);

    const remainingResultsCount = Number.parseInt(
      String(hasNextPageResult[0].count),
      10,
    );

    return {
      totalCount,
      remainingResultsCount,
    };
  });
}
