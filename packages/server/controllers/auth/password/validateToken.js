exports.validateToken = async (req, res) => {
  const emailToken = req.emailToken;

  /**
   * sending token as response for
   * development/testing/staging environment
   */
  const __token =
    process.env.NODE_ENV !== "production"
      ? {
          ...emailToken,
        }
      : "";

  res.status(200).send({
    reset: {
      valid: emailToken,
      ...__token,
    },
  });
};
