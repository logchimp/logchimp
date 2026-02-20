import { z } from "zod";
import type { Request, Response } from "express";
import type { Knex } from "knex";
import type {
  IApiErrorResponse,
  IPaginatedRoadmapsResponse,
  IRoadmapPrivate,
  IGetRoadmapsParams,
  TPermission,
  FilterVisibility,
} from "@logchimp/types";

// database
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { GET_ROADMAPS_FILTER_COUNT } from "../../../../constants";
import { parseAndValidateLimit } from "../../../../helpers";

const FilterVisibilitySchema = z.enum<FilterVisibility[]>([
  "public",
  "private",
]);
const querySchema = z.object({
  first: z.coerce
    .string()
    .transform((value) =>
      parseAndValidateLimit(value, GET_ROADMAPS_FILTER_COUNT),
    )
    .pipe(
      z
        .number()
        .int()
        .min(1)
        .max(GET_ROADMAPS_FILTER_COUNT)
        .default(GET_ROADMAPS_FILTER_COUNT),
    ),
  after: z.string().uuid().optional(),
  visibility: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(",") : []))
    .pipe(z.array(FilterVisibilitySchema)),
});

type ResponseBody = IPaginatedRoadmapsResponse | IApiErrorResponse;

interface GetRoadmapQueryOptions {
  first: number;
  after?: string;
  visibility: FilterVisibility[];
}

interface GetRoadmapMetadataOptions {
  after?: string;
  visibility: FilterVisibility[];
}

export async function filter(
  req: Request<IGetRoadmapsParams>,
  res: Response<ResponseBody>,
) {
  const query = querySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: query.error.issues,
    });
    return;
  }
  const { first, after, visibility: _visibility } = query.data;

  // @ts-expect-error
  const permissions = (req?.user?.permissions || []) as TPermission[];
  const hasPermission = permissions.includes("roadmap:read");

  // Sanitize visibility filter based on permission
  const visibility = sanitizeVisibility(_visibility, hasPermission);

  try {
    const data = await getRoadmapQuery({
      first,
      after,
      visibility,
    });
    const dataLength = data.length;

    const startCursor = data.length > 0 ? String(data[0].id) : null;
    const endCursor = data.length > 0 ? String(data[data.length - 1].id) : null;

    let totalCount: number | null = null;
    let totalPages: number | null = null;
    let currentPage = 1;
    let hasNextPage = false;

    const metadataResults = await getRoadmapMetadata({
      after,
      visibility,
    });
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
    logger.error({ message: err });

    res.status(500).json({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

function getRoadmapQuery({ first, after, visibility }: GetRoadmapQueryOptions) {
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

  query = applyVisibilityFilter(query, visibility);

  return query;
}

async function getRoadmapMetadata({
  after,
  visibility,
}: GetRoadmapMetadataOptions) {
  return database.transaction(async (trx) => {
    // Total count
    let totalCountQuery = trx("roadmaps");
    totalCountQuery = applyVisibilityFilter(totalCountQuery, visibility);
    const totalCountResult = await totalCountQuery
      .count<{ count: string | number }[]>("* as count")
      .first();

    // Has next page
    let hasNextPageSubquery = trx("roadmaps").as("next");
    if (after) {
      hasNextPageSubquery = hasNextPageSubquery
        .where(
          "index",
          ">=",
          trx("roadmaps").select("index").where("id", "=", after),
        )
        .offset(1);
    }
    hasNextPageSubquery = applyVisibilityFilter(
      hasNextPageSubquery,
      visibility,
    );

    const hasNextPageResult = await trx
      .count<{ count: string | number }[]>({ count: "*" })
      .from(hasNextPageSubquery)
      .first();

    const totalCount = Number.parseInt(String(totalCountResult.count), 10);

    const remainingResultsCount = Number.parseInt(
      String(hasNextPageResult.count),
      10,
    );

    return {
      totalCount,
      remainingResultsCount,
    };
  });
}

function applyVisibilityFilter<T>(
  query: Knex.QueryBuilder<T>,
  visibility: FilterVisibility[],
): Knex.QueryBuilder<T> {
  if (!visibility || visibility.length === 0) {
    // Default: show only public roadmaps
    // @ts-expect-error
    return query.where({ display: true });
  }

  const hasPublic = visibility.includes("public");
  const hasPrivate = visibility.includes("private");

  // query remains unchanged
  if (hasPublic && hasPrivate) {
    return query;
  } else if (hasPublic) {
    // Show only public
    // @ts-expect-error
    return query.where({ display: true });
  } else if (hasPrivate) {
    // Show only private
    // @ts-expect-error
    return query.where({ display: false });
  }
  // If neither public nor private is specified (edge case), show nothing
  else {
    // @ts-expect-error
    return query.where({ display: null });
  }
}

function sanitizeVisibility(
  visibility: FilterVisibility[],
  hasPermission: boolean,
): FilterVisibility[] {
  if (hasPermission) return visibility;
  return ["public"];
}
