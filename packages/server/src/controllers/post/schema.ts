import * as v from "valibot";

export const createPostRequestBodySchema = v.object({
  title: v.pipe(
    v.optional(v.string(), ""),
    v.trim(),
    v.transform(
      (value) =>
        value ||
        /**
         * @deprecated default value will be removed in next major release
         */
        "new post",
    ),
    v.trim(),
  ),
  contentMarkdown: v.optional(v.nullable(v.pipe(v.string(), v.trim()))),
});

export const updatePostRequestBodySchema = v.object({
  title: v.message(
    v.pipe(v.optional(v.string(), ""), v.trim(), v.nonEmpty()),
    "POST_TITLE_MISSING",
  ),
  contentMarkdown: v.optional(v.nullable(v.pipe(v.string(), v.trim()))),
});
