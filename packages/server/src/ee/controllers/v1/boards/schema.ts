import * as v from "valibot";

export const createBoardEERequestBodySchema = v.object({
  name: v.optional(
    v.nullable(
      v.pipe(
        v.string(),
        v.trim(),
        // v.minLength(1, "NAME_MIN_LENGTH"),
        v.maxLength(50, "NAME_MAX_LENGTH"),
      ),
    ),
  ),
  display: v.optional(v.boolean()),
});
