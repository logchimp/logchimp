// Load blacklisted domains once
const blacklistedDomains = process.env.BLACKLISTED_DOMAINS
  ? process.env.BLACKLISTED_DOMAINS.split(',').map(domain => domain.trim().toLowerCase())
  : [];

/**
 * Checking if the domain of a given email is blacklisted
 * @param {string} email
 * @returns {boolean}
 */
const isDomainBlacklisted = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return blacklistedDomains.includes(domain);
};

module.exports = { isDomainBlacklisted };
