// Inside domainBlacklist.js
const logger = require('../../utils/logger');
function isValidDomain(domain) {
  if (typeof domain !== 'string') return false;

  const trimmed = domain.trim().toLowerCase();

  if (trimmed.length === 0 || trimmed.length > 255) return false;

 
  const domainRegex = /^(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

  if (!domainRegex.test(trimmed)) {
    return false;
  }

  const labels = trimmed.split('.');

  for (const label of labels) {
    if (label.length === 0) { 
      return false;
    }
 
    if (label.startsWith('-') || label.endsWith('-')) {
      return false;
    }
 
    if (label.length >63) {
      return false;
    }
  }

  return true;

}

const parseBlacklistedDomains = (rawDomains) => {
  const result = new Set();

  if (!rawDomains || typeof rawDomains !== 'string') return result;

  rawDomains
    .split(',')
    .map(domain => domain.trim().toLowerCase())
    .forEach(domain => {
      if (!domain) return;
      if (!isValidDomain(domain)) {
        logger.warn(`Invalid domain in blacklist config: "${domain}"`);
        return;
      }
      result.add(domain);
    });

  return result;
};

const getBlacklistedDomains = () =>
  parseBlacklistedDomains(process.env.LOGCHIMP_BLACKLISTED_DOMAINS);

const isDomainBlacklisted = (email) => {
 if (typeof email !== 'string') return false;

  
  const trimmedEmail = email.trim(); 

  const parts = trimmedEmail.split('@'); 
  if (parts.length !== 2) return false;

  const domain = parts[1].toLowerCase();
 
  if (!isValidDomain(domain)) return false;

  
  return getBlacklistedDomains().has(domain);
};

module.exports = { isDomainBlacklisted, parseBlacklistedDomains,isValidDomain };
