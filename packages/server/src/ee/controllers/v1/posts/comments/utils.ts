import * as v from "valibot";

import error from "../../../../../errorResponse.json";

export const upsertCommentRequestBodySchema = v.object({
  is_internal: v.optional(v.boolean()),
  is_spam: v.optional(v.boolean()),
  body: v.pipe(v.string(), v.trim()),
});

export const upsertCommentRequestBodyErrorMap = {
  COMMENT_BODY_MISSING: error.api.comments.bodyMissing,
};