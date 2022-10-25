const _ = require("lodash");
const path = require("path");
const fs = require("fs-extra");
const { htmlToText } = require("html-to-text");

const generateContent = async (templateName, options) => {
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
};

module.exports = generateContent;
