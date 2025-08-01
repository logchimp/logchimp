import database from "../../database";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function filter(req, res) {
  try {
    // Get validated parameters from res.locals
    const { first, after } = res.locals.query;

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

    // Alternative approach using raw SQL for more predictable results
    let totalCount: number | null = null;
    let totalPages: number | null = null;

    if (!after) {
      const countResult = await database.raw('SELECT COUNT(*) as count FROM roadmaps');
      // Extract count from the raw result (format depends on your database)
      totalCount = Number(countResult[0]?.count || countResult.rows?.[0]?.count || 0);
      totalPages = Math.ceil(totalCount / first);
    }

    let currentPage = 1;
    if (after) {
      const afterCountResult = await database.raw('SELECT COUNT(*) as count FROM roadmaps WHERE id <= ?', [after]);
      const afterCount = Number(afterCountResult[0]?.count || afterCountResult.rows?.[0]?.count || 0);
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
    logger.error({ message: err });
    res.status(500).json({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
