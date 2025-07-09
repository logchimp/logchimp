// Valid domain regex (e.g., example.com, sub.domain.org)
const domainRegex = /^(?!-)([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

// Load and validate blacklisted domains
const blacklistedDomains = process.env.LOGCHIMP_BLACKLISTED_DOMAINS
  ? new Set(
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS
        .split(',')
        .map(domain => domain.trim().toLowerCase())
        .filter(domain => {
          if (!domain) return false; // remove empty strings
          const isValid = domainRegex.test(domain);
          if (!isValid) {
            console.warn(`⚠️ Invalid domain in blacklist config: "${domain}"`);
          }
          return isValid;
        })
    )
  : new Set();



/**
 * Checks if the domain of a given email is blacklisted.
 * @param {string} email
 * @returns {boolean}
 */
const isDomainBlacklisted = (email) => {
  if (typeof email !== 'string') return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false; // Invalid email with multiple '@' or missing

  const domain = parts[1].toLowerCase();

  // Check for valid domain format
  if (!domainRegex.test(domain)) return false;

  return blacklistedDomains.has(domain);
};

module.exports = { isDomainBlacklisted };
