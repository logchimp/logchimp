import * as v from "valibot";

export const updatePostRequestBodySchema = v.object({
  title: v.message(
    v.pipe(v.optional(v.string(), ""), v.trim(), v.nonEmpty()),
    "POST_TITLE_MISSING",
  ),
  contentMarkdown: v.optional(v.nullable(v.pipe(v.string(), v.trim()))),
});
