const bcrypt = require("bcryptjs");

exports.hashPassword = (password) => {
  if (typeof password !== "string" || !password.trim()) {
    return null;
  }

  const bcryptSaltRounds = 10;
  const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);
  return bcrypt.hashSync(password, bcryptSalt);
};

exports.validatePassword = async (password, hash) => {
  if (
    typeof password !== "string" ||
    typeof hash !== "string" ||
    !password.trim() ||
    !hash.trim()
  ) {
    return false;
  }

  return await bcrypt.compare(password, hash);
};
