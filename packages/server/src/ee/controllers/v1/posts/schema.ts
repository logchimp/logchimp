import * as v from "valibot";
import { updatePostRequestBodySchema } from "../../../../controllers/post/schema";

export const updatePostEERequestBodySchema = v.object({
  ...updatePostRequestBodySchema.entries,
  boardId: v.optional(v.nullable(v.string())),
  roadmapId: v.optional(v.nullable(v.string())),
  roadmap: v.optional(
    v.object({
      notifyVoters: v.boolean(),
    }),
  ),
});
