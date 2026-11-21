import * as v from "valibot";
import { isHexColor, isURL } from "validator";

import { sanitizeUrl } from "../../utils/sanitizeUrl";

export const settingsErrorMap: Record<string, string> = {
  INVALID_LOGO_URL: "Invalid Logo URL",
  LOGO_URL_TOO_LONG: "Logo URL is too long",
  INVALID_ACCENT_COLOR: "Invalid accent color",
  SITE_NAME_OR_LOGO_REQUIRED: "Either a site name or logo URL is required",
};

/**
 * Field that can be:
 * - absent: left untouched (`undefined`)
 * - `null` or `""`: cleared (`null`)
 * - any other string: validated against `inner`
 */
const clearable = (inner: v.GenericSchema<string, string>) =>
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

const logoSchema = clearable(
  v.pipe(
    v.string(),
    v.transform((value) => (sanitizeUrl(value.trim()) || "").trim()),
    v.check((value) => isURL(value), "INVALID_LOGO_URL"),
    v.check((value) => value.length <= 255, "LOGO_URL_TOO_LONG"),
  ),
);

const accentColorSchema = clearable(
  v.pipe(
    v.string(),
    v.check((value) => isHexColor(value), "INVALID_ACCENT_COLOR"),
  ),
);

export const updateSiteSettingsRequestBodySchema = v.object({
  title: v.optional(v.nullable(v.string())),
  description: v.optional(v.nullable(v.string())),
  logo: logoSchema,
  accentColor: accentColorSchema,
  allowSignup: v.optional(v.boolean()),
  googleAnalyticsId: v.optional(v.nullable(v.string())),
  developer_mode: v.optional(v.boolean()),
});
