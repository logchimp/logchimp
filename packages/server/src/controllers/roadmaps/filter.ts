import { z } from "zod";
import type { Request, Response } from "express";
import database from "../../database";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";


const querySchema = z.object({
  first: z.coerce.number().min(1).max(20).default(20),
  after: z.string().uuid().optional()
});


export async function filter(req: Request, res: Response) {
  try {
    const { first, after } = querySchema.parse(req.query);


    let query = database
      .select("id", "name", "url", "color", "display", "index")
      .from("roadmaps")
      .orderBy("id", "asc")
      .limit(first + 1);


    if (after) {
      query = query.where("id", ">", after);
    }


    const rows = await query;


    const hasNextPage = rows.length > first;
    const data = hasNextPage ? rows.slice(0, first) : rows;


    let totalCount: number | null = null;
    let totalPages: number | null = null;


    if (!after) {
      const countResult = await database('roadmaps').count('* as count');
      totalCount = totalCount = Number.parseInt(String(countResult[0].count), 10);
      totalPages = Math.ceil(totalCount / first);
    }


    let currentPage = 1;
    if (after) {
      const afterCountResult = await database('roadmaps')
        .where('id', '<=', after)
        .count('* as count');
      const afterCount = Number.parseInt(String(afterCountResult[0].count), 10);
      currentPage = Math.floor(afterCount / first) + 1;
    }


    res.status(200).json({
      results: data,
      roadmaps: data,
      page_info: {
        count: data.length,
        current_page: currentPage,
        has_next_page: hasNextPage,
        endCursor: data.length > 0 ? data[data.length - 1].id : null,
        startCursor: data.length > 0 ? data[0].id : null,
      },
      total_pages: totalPages,
      total_count: totalCount,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        errors: err.issues
      });
    }


    logger.error({ message: err });
    res.status(500).json({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
