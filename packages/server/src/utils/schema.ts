import * as v from "valibot";

/**
 * Field that can be:
 * - absent: left untouched (`undefined`)
 * - `null` or `""`: cleared (`null`)
 * - any other string: validated against `inner`
 */
export const clearable = (inner: v.GenericSchema<string, string>) =>
  v.optional(
    v.pipe(
      v.nullable(v.string()),
      v.transform((value) => (value === "" ? null : value)),
      v.rawTransform(({ dataset, addIssue, NEVER }) => {
        if (dataset.value === null) return null;

        const result = v.safeParse(inner, dataset.value);
        if (!result.success) {
          addIssue({ message: result.issues[0].message });
          return NEVER;
        }

        return result.output;
      }),
    ),
  );
