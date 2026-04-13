import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../database", () => {
  const db: any = vi.fn();
  db.transaction = vi.fn();
  db.delete = vi.fn();
  return { default: db };
});

vi.mock("../../utils/logger", () => ({
  default: { error: vi.fn() },
}));

import { VoteService } from "./vote.service";
import { ConflictError, NotFoundError, ErrorCode } from "../../utils/error";
import database from "../../database";

const mockDb = vi.mocked(database);

/**
 * Creates a chainable Knex-like query builder mock.
 * All chaining methods return the same builder; terminal methods return promises.
 */
function createQB(resolveValue: unknown = undefined) {
  const qb: any = {};
  const self = () => qb;

  qb.select = vi.fn(self);
  qb.from = vi.fn(self);
  qb.where = vi.fn(self);
  qb.andWhere = vi.fn(self);
  qb.orWhere = vi.fn(self);
  qb.innerJoin = vi.fn(self);
  qb.orderBy = vi.fn(self);
  qb.limit = vi.fn(self);
  qb.count = vi.fn(self);
  qb.as = vi.fn().mockReturnValue(qb);
  qb.insert = vi.fn(self);
  qb.into = vi.fn().mockResolvedValue(undefined);
  qb.first = vi.fn().mockResolvedValue(resolveValue);
  // Make the builder thenable so `await qb` resolves to `resolveValue`
  // biome-ignore lint/suspicious/noThenProperty: <explanation>
  qb.then = (resolve: any, reject: any) =>
    Promise.resolve(resolveValue).then(resolve, reject);

  return qb;
}

describe("VoteService", () => {
  let service: VoteService;

  beforeEach(() => {
    service = new VoteService();
    vi.resetAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getVotes
  // ---------------------------------------------------------------------------

  describe("getVotes", () => {
    it("returns empty result immediately when postId is an empty string", async () => {
      const result = await service.getVotes({
        postId: "",
        options: { first: 10, after: null },
      });

      expect(result.results).toEqual([]);
      expect(result.total_count).toBe(0);
      expect(result.total_pages).toBe(0);
      expect(result.page_info).toMatchObject({
        count: 0,
        current_page: 0,
        has_next_page: false,
        start_cursor: null,
        end_cursor: null,
      });
      // No DB interaction expected
      expect(mockDb).not.toHaveBeenCalled();
    });

    it("returns paginated votes with correct page_info when results exist", async () => {
      const fakeVotes = [
        {
          voteId: "vote-1",
          userId: "user-1",
          name: "Alice",
          username: "alice",
          avatar: "https://example.com/alice.jpg",
        },
        {
          voteId: "vote-2",
          userId: "user-2",
          name: "Bob",
          username: "bob",
          avatar: "https://example.com/bob.jpg",
        },
      ];

      // First call: getVotesQuery
      const votesQB = createQB(fakeVotes);
      // Second call (inside getVotesMetadata transaction): trx("votes") for totalCount
      const metadataQB = createQB({ count: "10" });

      mockDb
        .mockReturnValueOnce(votesQB) // getVotesQuery → database("votes")
        .mockReturnValueOnce(metadataQB); // getVotesMetadata trx("votes") for count

      vi.mocked(database.transaction).mockImplementation(async (cb: any) => {
        const mockTrx: any = vi.fn(() => metadataQB);
        mockTrx.count = vi.fn(() => metadataQB);
        mockTrx.from = vi.fn(() => metadataQB);
        return cb(mockTrx);
      });

      const result = await service.getVotes({
        postId: "post-1",
        options: { first: 5, after: null },
      });

      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toEqual({
        voteId: "vote-1",
        user: {
          userId: "user-1",
          name: "Alice",
          username: "alice",
          avatar: "https://example.com/alice.jpg",
        },
      });
      expect(result.page_info.count).toBe(2);
      expect(result.page_info.start_cursor).toBe("vote-1");
      expect(result.page_info.end_cursor).toBe("vote-2");
    });

    it("returns empty results with null cursors when no votes exist", async () => {
      // For getVotesQuery call
      const emptyVotesQB = createQB([]);
      // For getVotesMetadata transaction call
      const countQB = createQB({ count: "0" });

      mockDb.mockReturnValueOnce(emptyVotesQB);

      vi.mocked(database.transaction).mockImplementation(async (cb: any) => {
        const mockTrx: any = vi.fn(() => countQB);
        mockTrx.count = vi.fn(() => countQB);
        mockTrx.from = vi.fn(() => countQB);
        return cb(mockTrx);
      });

      const result = await service.getVotes({
        postId: "post-1",
        options: { first: 10, after: null },
      });

      expect(result.results).toEqual([]);
      expect(result.page_info.count).toBe(0);
      expect(result.page_info.start_cursor).toBeNull();
      expect(result.page_info.end_cursor).toBeNull();
    });

    it("re-throws errors from the database", async () => {
      const dbError = new Error("DB connection failed");
      mockDb.mockReturnValue(createQB([]));
      vi.mocked(database.transaction).mockRejectedValue(dbError);

      await expect(
        service.getVotes({
          postId: "post-1",
          options: { first: 10, after: null },
        }),
      ).rejects.toThrow("DB connection failed");
    });
  });

  // ---------------------------------------------------------------------------
  // castVote
  // ---------------------------------------------------------------------------

  describe("castVote", () => {
    it("returns a new voteId when the user has not yet voted on the post", async () => {
      const trxQB = createQB(null); // getVote returns null → no existing vote

      vi.mocked(database.transaction).mockImplementation(async (cb: any) => {
        const mockTrx: any = vi.fn(() => trxQB);
        mockTrx.select = vi.fn(() => trxQB);
        mockTrx.insert = vi.fn(() => trxQB);
        return cb(mockTrx);
      });

      const voteId = await service.castVote("post-1", "user-1");

      expect(typeof voteId).toBe("string");
      expect(voteId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("throws ConflictError with VOTE_EXISTS code when vote already exists", async () => {
      const existingVote = {
        voteId: "existing-vote",
        userId: "user-1",
        postId: "post-1",
        createdAt: new Date(),
      };
      const trxQB = createQB(existingVote); // getVote returns an existing vote

      vi.mocked(database.transaction).mockImplementation(async (cb: any) => {
        const mockTrx: any = vi.fn(() => trxQB);
        mockTrx.select = vi.fn(() => trxQB);
        return cb(mockTrx);
      });

      await expect(service.castVote("post-1", "user-1")).rejects.toThrow(
        ConflictError,
      );

      try {
        await service.castVote("post-1", "user-1");
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictError);
        expect((err as ConflictError).code).toBe(ErrorCode.VOTE_EXISTS);
      }
    });

    it("re-throws unexpected database errors", async () => {
      const dbError = new Error("Unexpected DB error");
      vi.mocked(database.transaction).mockRejectedValue(dbError);

      await expect(service.castVote("post-1", "user-1")).rejects.toThrow(
        "Unexpected DB error",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // retractVote
  // ---------------------------------------------------------------------------

  describe("retractVote", () => {
    it("resolves successfully when the vote exists and is deleted", async () => {
      const mockWhere = vi.fn().mockResolvedValue(1); // 1 row deleted
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(database.delete).mockReturnValue({ from: mockFrom } as any);

      await expect(
        service.retractVote("post-1", "user-1"),
      ).resolves.toBeUndefined();
    });

    it("throws NotFoundError with VOTE_NOT_FOUND code when no vote row is deleted", async () => {
      const mockWhere = vi.fn().mockResolvedValue(0); // 0 rows deleted
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(database.delete).mockReturnValue({ from: mockFrom } as any);

      await expect(service.retractVote("post-1", "user-1")).rejects.toThrow(
        NotFoundError,
      );

      try {
        await service.retractVote("post-1", "user-1");
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
        expect((err as NotFoundError).code).toBe(ErrorCode.VOTE_NOT_FOUND);
      }
    });

    it("re-throws unexpected database errors", async () => {
      const dbError = new Error("DB write error");
      const mockWhere = vi.fn().mockRejectedValue(dbError);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(database.delete).mockReturnValue({ from: mockFrom } as any);

      await expect(service.retractVote("post-1", "user-1")).rejects.toThrow(
        "DB write error",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getUserVote
  // ---------------------------------------------------------------------------

  describe("getUserVote", () => {
    it("returns a structured IUserVoteV2 when the vote exists", async () => {
      const row = {
        voteId: "vote-abc",
        userId: "user-xyz",
        name: "Jane Doe",
        username: "janedoe",
        avatar: "https://example.com/jane.jpg",
      };
      const qb = createQB(row);
      mockDb.mockReturnValue(qb);

      const result = await service.getUserVote("post-1", "user-xyz");

      expect(result).toEqual({
        voteId: "vote-abc",
        user: {
          userId: "user-xyz",
          name: "Jane Doe",
          username: "janedoe",
          avatar: "https://example.com/jane.jpg",
        },
      });
    });

    it("returns undefined when the user has not voted on the post", async () => {
      const qb = createQB(undefined);
      mockDb.mockReturnValue(qb);

      const result = await service.getUserVote("post-1", "user-xyz");

      expect(result).toBeUndefined();
    });
  });
});
