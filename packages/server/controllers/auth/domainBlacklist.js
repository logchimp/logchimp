// Load blacklisted domains once
const blacklistedDomains = process.env.LOGCHIMP_BLACKLISTED_DOMAINS?
     new Set(process.env.LOGCHIMP_BLACKLISTED_DOMAINS.split(',').map(domain => domain.trim().toLowerCase())
    )
  : new Set();


/**
 * Checking if the domain of a given email is blacklisted
 * @param {string} email
 * @returns {boolean}
 */
const isDomainBlacklisted = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return blacklistedDomains.has(domain);
};

module.exports = { isDomainBlacklisted };

