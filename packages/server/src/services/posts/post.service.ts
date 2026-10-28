import { toSlug } from "../../helpers";
import { nanoid } from "nanoid";

export class PostService {
  SLUG_LENGTH = 20;
  POST_TITLE_MAX_LENGTH = 100;

  titleDescriptionOverflow(title: string, description: string) {
    if (title.length > this.POST_TITLE_MAX_LENGTH) {
      const exceedingText = title.slice(this.POST_TITLE_MAX_LENGTH - 3);
      title = `${title.slice(0, this.POST_TITLE_MAX_LENGTH - 3)}...`;
      description = `...${exceedingText}${description ? `\n\n${description}` : ""}`;
    }

    return {
      title,
      description,
    };
  }

  generateSlug(title: string, slugId?: string) {
    const _slugId = slugId ?? nanoid(this.SLUG_LENGTH);
    const slug = `${toSlug(title)}-${_slugId}`;
    return {
      slug,
      slugId: _slugId,
    };
  }
}
