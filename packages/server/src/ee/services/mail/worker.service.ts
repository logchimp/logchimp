import database from "../../../database";
import type { ISendPostRoadmapChangeMailPayload } from "./types";
import { mail } from "../../../services/mail";
import { configManager } from "../../../utils/logchimpConfig";
import { generateContent } from "../../../services/mail";
import type { BaseEmailData } from "../../../services/mail/generateContent";

const config = configManager.getConfig();

export async function sendPostRoadmapChangeMail(
  payload: ISendPostRoadmapChangeMailPayload,
) {
  try {
    /**
     * Get site title for using it in email footer
     */
    const siteInfo = await database
      .select<
        Array<{
          title: string;
          accentColor: string;
          logo: string;
        }>
      >("title", "accentColor", "logo")
      .from("settings");

    if (siteInfo.length === 0) {
      throw new Error("Site settings not found");
    }

    const siteTitle = siteInfo[0].title;
    let brandColor = siteInfo[0].accentColor;
    const siteLogo =
      siteInfo[0].logo ||
      "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png";

    if (brandColor && !brandColor.startsWith("#")) {
      brandColor = `#${brandColor}`;
    }

    const urlObject = new URL(config.webUrl);

    const content = await generateContent<
      ISendPostRoadmapChangeMailPayload & BaseEmailData
    >("dashboard/post-roadmap-change-notification", {
      displayName: payload.displayName,
      recipientEmail: payload.recipientEmail,
      postUrl: payload.postUrl,
      postTitle: payload.postTitle,
      postDescription: payload.postDescription,
      roadmapTitle: payload.roadmapTitle,
      roadmapColor: payload.roadmapColor,
      url: urlObject.origin,
      domain: urlObject.host,
      siteTitle,
      brandColor,
      siteLogo,
    });

    const noReplyEmail = `noreply@${urlObject.hostname}`;

    await mail.sendMail({
      from: noReplyEmail,
      to: payload.recipientEmail,
      subject: `Post you upvoted has an update - ${siteTitle}`,
      text: content.text,
      html: content.html,
    });
  } catch (err) {
    throw new Error(err);
  }
}
