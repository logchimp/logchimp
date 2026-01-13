import type { Request, Response } from "express";
import type {
  IRole,
  IApiErrorResponse,
  IPaginatedRolesResponse,
  TPermission,
  IGetRolesParams,
} from "@logchimp/types";
import * as v from "valibot";
import database from "../../../../database";

// utils
import error from "../../../../errorResponse.json";
import logger from "../../../../utils/logger";
import { parseAndValidateLimit } from "../../../../helpers";
import { GET_ROLES_FILTER_COUNT } from "../../../../constants";

type ResponseBody = IPaginatedRolesResponse | IApiErrorResponse;

const querySchema = v.object({
  first: v.pipe(
    v.optional(v.string(), ""),
    v.transform((value) =>
      parseAndValidateLimit(String(value), GET_ROLES_FILTER_COUNT),
    ),
    v.minValue(1, "MIN_VALUE_1"),
  ),
  after: v.optional(v.pipe(v.string(), v.trim(), v.uuid("INVALID_UUID"))),
});

const querySchemaErrorMap = {
  MIN_VALUE_1: error.general.minValue1,
};

export async function get(
  req: Request<IGetRolesParams>,
  res: Response<ResponseBody>,
) {
  const query = v.safeParse(querySchema, req.query);
  if (!query.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: query.issues.map((issue) => ({
        ...issue,
        message: querySchemaErrorMap[issue.message]
          ? querySchemaErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  const checkPermission = permissions.includes("role:read");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const { first, after } = query.output;

  try {
    const data = await getRolesQuery({
      first,
      after,
    });
    const dataLength = data.length;

    const startCursor = data.length > 0 ? String(data[0].id) : null;
    const endCursor = data.length > 0 ? String(data[data.length - 1].id) : null;

    let totalCount: number | null = null;
    let totalPages: number | null = null;
    let currentPage = 1;
    let hasNextPage = false;

    const metadataResults = await getRoleMetadata({
      after,
    });
    if (metadataResults) {
      totalCount = metadataResults.totalCount;
      totalPages = Math.ceil(metadataResults.totalCount / first);
      hasNextPage = metadataResults.remainingResultsCount > dataLength;

      const seenResults = totalCount - metadataResults.remainingResultsCount;
      const deliveredThroughCurrentPage = seenResults + dataLength;
      currentPage =
        deliveredThroughCurrentPage > 0
          ? Math.ceil(deliveredThroughCurrentPage / first)
          : currentPage;
    }

    res.status(200).send({
      results: data,
      roles: data,
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
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

interface GetRolesQueryOptions {
  first: number;
  after?: string;
}

async function getRolesQuery({ first, after }: GetRolesQueryOptions) {
  let query = database
    .select<IRole[]>("id", "name", "description", "created_at", "updated_at")
    .from("roles")
    .orderBy([
      { column: "created_at", order: "desc" },
      { column: "id", order: "desc" },
    ])
    .limit(first);

  if (after) {
    query = query.whereRaw(
      "(created_at, id) < (SELECT created_at, id FROM roles WHERE id = ?)",
      [after],
    );
  }

  return query;
}

interface GetRolesMetadataOptions {
  after?: string;
}

function getRoleMetadata({ after }: GetRolesMetadataOptions) {
  return database.transaction(async (trx) => {
    // Total count
    const totalCountQuery = trx("roles");
    const totalCountResult = await totalCountQuery
      .count<{ count: string | number }[]>("* as count")
      .first();

    // Has next page
    let hasNextPageSubquery = trx("roles").as("next");
    if (after) {
      hasNextPageSubquery = hasNextPageSubquery.whereRaw(
        "(created_at, id) < (SELECT created_at, id FROM roles WHERE id = ?)",
        [after],
      );
    }

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
