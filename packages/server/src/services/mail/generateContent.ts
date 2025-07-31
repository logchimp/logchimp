import _ from "lodash";
import path from "path";
import { htmlToText } from "html-to-text";

import logger from "../../utils/logger";
import { readFile } from "../../helpers";

interface IGenerateContentBaseOptions {
  readonly url: string;
  readonly domain: string;
}

type IGenerateContentOptions = IGenerateContentBaseOptions &
  Record<string, string>;

export async function generateContent(
  templateName: string,
  options: IGenerateContentOptions,
) {
  const mailTemplateFilePath = path.resolve(
    __dirname,
    "templates",
    `${templateName}.html`,
  );

  let fileContent: string | Error;
  try {
    fileContent = await readFile(mailTemplateFilePath);
  } catch (error) {
    logger.error({
      message: error,
    });
    return;
  }

  if (typeof fileContent !== "string") {
    logger.warn({
      message: `file content empty [file path: ${mailTemplateFilePath}]`,
      error: fileContent,
    });
    return;
  }

  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  const compiled = _.template(fileContent);
  const htmlMail = compiled(options);

  const textMail = htmlToText(htmlMail);

  return {
    html: htmlMail,
    text: textMail,
  };
}
