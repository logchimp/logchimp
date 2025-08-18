// schemas.ts
import { z } from "zod";

// Schema 1
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  contentMarkdown: z.string().min(1, "Content is required"),
  boardId: z.string().uuid("Invalid boardId"),
 });

// Schema 2 (for filtering/pagination)
export const queryPostsSchema = z.object({
  created: z.enum(["top", "latest", "oldest", "trending"]).optional(),
  page: z.number().int().min(0).default(0), // page - 1 in your code
  limit: z.number().int().min(1).default(10),
  boardId: z.string().uuid("Invalid boardId").optional(), // validUUIDs means maybe multiple?
  userId: z.string().uuid("Invalid userId").optional(),
  roadmapId: z.string().uuid("Invalid roadmapId").optional(),
});

// Body schema
export const BodySchema = z.object({
  body: z.string().min(1, "Comment body cannot be empty"),
  is_internal: z.boolean().optional(),
  is_spam: z.boolean().optional(),
});
export const Body1Schema = z.object({
  body: z.string().min(1, "Comment body cannot be empty"),
  is_internal : z.boolean().optional(),
  parent_id : z.boolean().optional(),
})

