import * as v from "valibot";

import error from "../../../../../errorResponse.json";

export const upsertCommentRequestBodySchema = v.object({
  is_internal: v.optional(v.boolean()),
  is_spam: v.optional(v.boolean()),
  body: v.message(
    v.pipe(v.optional(v.string(), ""), v.trim(), v.nonEmpty()),
    "COMMENT_BODY_MISSING",
  ),
});

export const upsertCommentRequestBodyErrorMap = {
  COMMENT_BODY_MISSING: error.api.comments.bodyMissing,
};
