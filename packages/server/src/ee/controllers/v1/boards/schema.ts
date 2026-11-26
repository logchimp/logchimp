import * as v from "valibot";
import { BOARD_NAME_MAX_LENGTH } from "../../../../constants";

export const createBoardEERequestBodySchema = v.object({
  name: v.optional(
    v.nullable(
      v.pipe(
        v.string(),
        v.trim(),
        // v.minLength(1, "NAME_MIN_LENGTH"),
        v.maxCodePoints(BOARD_NAME_MAX_LENGTH, "NAME_MAX_LENGTH"),
      ),
    ),
  ),
  display: v.optional(v.boolean()),
});
