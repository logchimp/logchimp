const logger = require("../../utils/logger");

// Valid domain regex (e.g., example.com, sub.domain.org)
const domainRegex = /^(?!-)([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

// Load and validate blacklisted domains
const blacklistedDomains=new Set();
const rawDomains = process.env.LOGCHIMP_BLACKLISTED_DOMAINS;

if (rawDomains) {
  rawDomains
    .split(',')
    .map(domain => domain.trim().toLowerCase())
    .forEach(domain => {
      if (!domain) return; 
      if (!domainRegex.test(domain)) {
        logger.warn(`Invalid domain in blacklist config: "${domain}"`);
        return;
      }

      blacklistedDomains.add(domain);
    });
  }


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
