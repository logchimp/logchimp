import * as v from "valibot";

import { validUUID } from "../../../../helpers";
import {
  createPostRequestBodySchema,
  updatePostRequestBodySchema,
} from "../../../../controllers/post/schema";

export const createPostEERequestBodySchema = v.object({
  ...createPostRequestBodySchema.entries,
  boardId: v.optional(v.nullable(v.pipe(v.string(), v.transform(validUUID)))),
});

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
