import database from "../../../database";

import type { ApiSortType } from "@logchimp/types";

import logger from "../../../utils/logger";

interface getBoardQueryOptions {
    limit: number;
    after?: string;
    created: ApiSortType;
    page?: number;
}

interface getBoardMetaDataOptions {
    after?: string;
}

export async function getBoards({
    limit,
    after,
    created,
    page }: getBoardQueryOptions) {
    try {
        let boards = database
            .select(
                "boards.boardId",
                "boards.name",
                "boards.color",
                "boards.url",
                "boards.createdAt",
            )
            .count("posts", { as: "post_count" })
            .from("boards")
            .leftJoin("posts", "boards.boardId", "posts.boardId")
            .where({
                display: true,
            })
            .groupBy("boards.boardId")
            .orderBy("boards.createdAt", created)
            .orderBy("boards.boardId", "asc")
            .limit(limit)

        if (page) {
            boards = boards.offset(limit * (page - 1));
        } else if (after) {

            const afterBoard = await database("boards")
                .select("createdAt", "boardId")
                .where("boardId", "=", after)
                .first();
            if (created === "ASC") {
                boards = boards.where(function () {
                    this.where("createdAt", ">", afterBoard.createdAt)
                        .orWhere(function () {
                            this.where("createdAt", "=", afterBoard.createdAt)
                                .andWhere("boardId", ">", after);
                        });
                });
            } else {
                boards = boards.where(function () {
                    this.where("createdAt", "<", afterBoard.createdAt)
                        .orWhere(function () {
                            this.where("createdAt", "=", afterBoard.createdAt)
                                .andWhere("boardId", "<", after);
                        });
                });
            }

        }
        const boardsData = await boards;
        return boardsData;
    } catch (error) {
        logger.log({
            level: "error",
            message: error
        })
    }

    return [];
}

export async function getBoardMetaData({ after }: getBoardMetaDataOptions) {
    const totalCountResult = await database("boards")
        .where("display", true)
        .count<{ count: string }>("* as count")
        .first();

    const totalBoardsCount = Number(totalCountResult?.count || 0);

    let remainingBoardsCount = totalBoardsCount;
    if (after) {
        const afterBoard = await database("boards")
            .select("createdAt")
            .where("boardId", after)
            .first();

        if (afterBoard) {

            const subQuery = database("boards")
                .where("display", true)
                .andWhere("createdAt", ">=", afterBoard.createdAt)
                .offset(1);

            const remaining = await database
                .count<{ count: string }>("* as count")
                .from(subQuery.as("next"))
                .first();

            remainingBoardsCount = Number(remaining?.count || 0);
        }
    }

    return {
        totalBoardsCount,
        remainingBoardsCount
    };

}