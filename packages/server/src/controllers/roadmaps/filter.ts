import { z } from "zod"; // Add this import
import database from "../../database";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

// Move the schema from route to controller
const querySchema = z.object({
  first: z.coerce.number().min(1).max(100).default(20),
  after: z.string().uuid().optional()
});

export async function filter(req, res) {
  try {
    // Validate query parameters at the start of controller
    const { first, after } = querySchema.parse(req.query);

    // Build cursor query
    let query = database
      .select("id", "name", "url", "color", "display", "index")
      .from("roadmaps")
      .orderBy("id", "asc")
      .limit(first + 1);

    if (after) {
      query = query.where("id", ">", after);
    }

    const rows = await query;

    // Determine pagination flags
    const hasNextPage = rows.length > first;
    const data = hasNextPage ? rows.slice(0, first) : rows;

    // Get total count (only on first page for performance)
    let totalCount: number | null = null;
    let totalPages: number | null = null;

    if (!after) {
      const countResult = await database('roadmaps').count('* as count');
      totalCount = Number(countResult[0].count);
      totalPages = Math.ceil(totalCount / first);
    }

    // Calculate current page
    let currentPage = 1;
    if (after) {
      const afterCountResult = await database('roadmaps')
        .where('id', '<=', after)
        .count('* as count');
      const afterCount = Number(afterCountResult[0].count);
      currentPage = Math.floor(afterCount / first) + 1;
    }

    // Response with consistent format
    res.status(200).json({
      data,
      page_info: {
        count: data.length,
        current_page: currentPage,
        has_next_page: hasNextPage,
      },
      total_pages: totalPages,
      total_count: totalCount,
    });
  } catch (err) {
    // Handle validation errors specifically
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
