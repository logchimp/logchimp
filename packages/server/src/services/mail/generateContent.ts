import _ from "lodash";
import path from "path";
import fs from "fs";
import { htmlToText } from "html-to-text";

export async function generateContent(templateName, options) {
  const mailTemplateFilePath = path.resolve(
    __dirname,
    "templates",
    `${templateName}.html`,
  );

  try {
    const mailTemplateFileContent = await fs.readFile(
      mailTemplateFilePath,
      "utf8",
    );

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    const compiled = _.template(mailTemplateFileContent);
    const htmlMail = compiled(options);

    const textMail = htmlToText(htmlMail);

    return {
      html: htmlMail,
      text: textMail,
    };
  } catch (error) {
    console.error(error);
  }
}
