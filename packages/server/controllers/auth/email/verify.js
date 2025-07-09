// services
const verifyEmail = require("../../../services/auth/verifyEmail");

// utils
const logger = require("../../../utils/logger");
const error = require("../../../errorResponse.json");
const { isDomainBlacklisted } = require("../domainBlacklist");
exports.verify = async (req, res) => {
  const { userId, email, isVerified } = req.user;
  if (isDomainBlacklisted(email)) {
    return res.status(403).send({
      message: "Email domain is not allowed.",
      code: "EMAIL_DOMAIN_BLACKLISTED",
    });
  }
  if (isVerified) {
    return res.status(409).send({
      message: error.api.emailVerify.emailAlreadyVerified,
      code: "EMAIL_VERIFIED",
    });
  }

  try {
    const tokenPayload = {
      userId,
      email,
      type: "emailVerification",
    };
    const url = req.headers.origin;
    const emailVerification = await verifyEmail(url, tokenPayload);

    /**
     * sending token as response is for
     * development/testing/staging environment
     */
    const __token =
      process.env.NODE_ENV !== "production"
        ? {
            ...emailVerification,
          }
        : "";

    res.status(200).send({
      verify: {
        success: emailVerification,
        ...__token,
      },
    });
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
};
