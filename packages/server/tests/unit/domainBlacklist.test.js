import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import path from 'path'; 


const mockLogger = {
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
};


const loggerAbsolutePath = path.resolve(
  __dirname,
  '../../utils/logger.js' 
);


let isDomainBlacklisted;
let parseBlacklistedDomainsModule;
let isValidDomain;

beforeAll(async () => {
 
  require.cache[loggerAbsolutePath] = { exports: mockLogger };

  const domainBlacklistModule = await vi.importActual('../../controllers/auth/domainBlacklist');


  isDomainBlacklisted = domainBlacklistModule.isDomainBlacklisted;
  parseBlacklistedDomainsModule = domainBlacklistModule.parseBlacklistedDomains;
  isValidDomain = domainBlacklistModule.isValidDomain;
});

beforeEach(() => {
  mockLogger.warn.mockClear();
  mockLogger.info.mockClear();
  mockLogger.error.mockClear();
});

afterEach(() => {
 
  delete require.cache[loggerAbsolutePath];
  vi.restoreAllMocks(); 
});


describe('isDomainBlacklisted', () => {
  let originalEnvBlacklistedDomains;

  beforeAll(() => {
    
    originalEnvBlacklistedDomains = process.env.LOGCHIMP_BLACKLISTED_DOMAINS;
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
  });

  afterAll(() => {
   
    if (originalEnvBlacklistedDomains !== undefined) {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = originalEnvBlacklistedDomains;
    } else {
      delete process.env.LOGCHIMP_BLACKLISTED_DOMAINS;
    }
  });

  it('should return true for blacklisted domains', () => {
    expect(isDomainBlacklisted('user@example.com')).toBeTruthy();
    expect(isDomainBlacklisted('test@test.com')).toBeTruthy();
    expect(isDomainBlacklisted('admin@spam.com')).toBeTruthy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should return false for non-blacklisted domains', () => {
    expect(isDomainBlacklisted('hello@good.com')).toBeFalsy();
    expect(isDomainBlacklisted('admin@other.org')).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should return false for invalid email formats', () => {
    expect(isDomainBlacklisted('not-an-email')).toBeFalsy();
    expect(isDomainBlacklisted('user@@spam.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@')).toBeFalsy();
    expect(isDomainBlacklisted('@domain.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@domain')).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should be case insensitive', () => {
    expect(isDomainBlacklisted('USER@Spam.com')).toBeTruthy();
    expect(isDomainBlacklisted('ADMIN@bAdSiTe.ORG')).toBeTruthy();
    expect(isDomainBlacklisted('uSeR@eXaMpLe.CoM')).toBeTruthy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should return false for non-string input', () => {
    expect(isDomainBlacklisted(null)).toBeFalsy();
    expect(isDomainBlacklisted(undefined)).toBeFalsy();
    expect(isDomainBlacklisted(42)).toBeFalsy();
    expect(isDomainBlacklisted([])).toBeFalsy();
    expect(isDomainBlacklisted({})).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should handle blacklisted domains with subdomains (should be false unless specifically blacklisted)', () => {
    expect(isDomainBlacklisted('user@sub.example.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@another.test.com')).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should handle domains with leading/trailing spaces in the email', () => {
    expect(isDomainBlacklisted(' user@example.com ')).toBeTruthy();
    expect(isDomainBlacklisted('user@spam.com ')).toBeTruthy();
    expect(isDomainBlacklisted(' user@test.com')).toBeTruthy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should return false if blacklisted domains environment variable is empty or invalid', () => {
   
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';
    expect(isDomainBlacklisted('user@example.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@test.com')).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled(); 

   
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'invalid-domain-!!, another.com';
    mockLogger.warn.mockClear(); 
    expect(isDomainBlacklisted('user@invalid-domain-!!.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@another.com')).toBeTruthy();
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "invalid-domain-!!"');
  });

  it('should handle multiple blacklisted domains and non-blacklisted domains correctly', () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'domain1.com, domain2.org, domain3.net';
    expect(isDomainBlacklisted('user@domain1.com')).toBeTruthy();
    expect(isDomainBlacklisted('user@domain2.org')).toBeTruthy();
    expect(isDomainBlacklisted('user@domain3.net')).toBeTruthy();
    expect(isDomainBlacklisted('user@domain4.xyz')).toBeFalsy();
    expect(isDomainBlacklisted('user@domain1.net')).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should return false for valid domains not in the blacklist', () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'foo.com, bar.net';
    expect(isDomainBlacklisted('user@baz.org')).toBeFalsy();
    expect(isDomainBlacklisted('info@qux.io')).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should handle domains with different TLD lengths', () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'shorttld.co, longtld.museum';
    expect(isDomainBlacklisted('user@shorttld.co')).toBeTruthy();
    expect(isDomainBlacklisted('user@longtld.museum')).toBeTruthy();
    expect(isDomainBlacklisted('user@onetld.x')).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should treat an invalid domain in email as non-blacklisted even if it looks like a blacklisted one', () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com';
    expect(isDomainBlacklisted('user@-example.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@.test.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@spam.com.')).toBeFalsy();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });
});


describe('isValidDomain', () => {
  it('should return true for valid simple domains', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('test.org')).toBe(true);
    expect(isValidDomain('sub.domain.net')).toBe(true);
    expect(isValidDomain('another-site.info')).toBe(true);
    expect(isValidDomain('long-domain-name-with-hyphens.co.uk')).toBe(true);
  });

  it('should handle case insensitivity', () => {
    expect(isValidDomain('EXAMPLE.COM')).toBe(true);
    expect(isValidDomain('TeSt.oRg')).toBe(true);
  });

  it('should return true for domains with numbers', () => {
    expect(isValidDomain('123example.com')).toBe(true);
    expect(isValidDomain('domain-123.net')).toBe(true);
  });

  it('should return false for null, undefined, or non-string input', () => {
    expect(isValidDomain(null)).toBe(false);
    expect(isValidDomain(undefined)).toBe(false);
    expect(isValidDomain(123)).toBe(false);
    expect(isValidDomain({})).toBe(false);
    expect(isValidDomain([])).toBe(false);
  });

  it('should return false for empty string or only spaces', () => {
    expect(isValidDomain('')).toBe(false);
    expect(isValidDomain('   ')).toBe(false);
  });

  it('should return false for domains with invalid characters', () => {
    expect(isValidDomain('bad@domain.com')).toBe(false);
    expect(isValidDomain('domain!.com')).toBe(false);
    expect(isValidDomain('dom_ain.com')).toBe(false);
    expect(isValidDomain('with space.com')).toBe(false);
  });

  it('should return false for domains starting/ending with hyphens', () => {
    expect(isValidDomain('-example.com')).toBe(false);
    expect(isValidDomain('example-.com')).toBe(false);
  });

  it('should return false for domains starting/ending with dots', () => {
    expect(isValidDomain('.example.com')).toBe(false);
    expect(isValidDomain('example.com.')).toBe(false);
  });

  it('should return false for domains with empty labels', () => {
    expect(isValidDomain('example..com')).toBe(false);
    expect(isValidDomain('example.com.')).toBe(false);
    expect(isValidDomain('.example.com')).toBe(false);
  });

  it('should return false for invalid TLDs (too short or missing)', () => {
    expect(isValidDomain('example.c')).toBe(false);
    expect(isValidDomain('example')).toBe(false);
    expect(isValidDomain('example.')).toBe(false);
  });

  it('should return false for labels starting/ending with hyphens', () => {
    expect(isValidDomain('sub-.example.com')).toBe(false);
    expect(isValidDomain('-sub.example.com')).toBe(false);
    expect(isValidDomain('example.-com')).toBe(false);
  });

  it('should return false for labels exceeding 63 characters', () => {
    const longLabel = 'a'.repeat(64);
    expect(isValidDomain(`${longLabel}.com`)).toBe(false);
  });

  it('should return false for an IP address', () => {
    expect(isValidDomain('192.168.1.1')).toBe(false);
  });

  it('should return false for localhost', () => {
    expect(isValidDomain('localhost')).toBe(false);
  });
});


describe('parseBlacklistedDomains', () => {
  it('should return a set of valid domains', () => {
    const input = 'example.com, test.org, valid.net';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set(['example.com', 'test.org', 'valid.net']));
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should trim spaces and convert to lowercase', () => {
    const input = '   Foo.COM , BAR.org ';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set(['foo.com', 'bar.org']));
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should skip empty domains and not warn for them', () => {
    const input = 'one.com, , ,two.org';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set(['one.com', 'two.org']));
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should return an empty set for empty, null, or undefined input', () => {
    expect(parseBlacklistedDomainsModule('')).toEqual(new Set());
    expect(parseBlacklistedDomainsModule(null)).toEqual(new Set());
    expect(parseBlacklistedDomainsModule(undefined)).toEqual(new Set());
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should ignore invalid domains and log a warning for each', () => {
    const input = 'good.com, bad@domain, .invalid, another.good';
    const result = parseBlacklistedDomainsModule(input);

    expect(result).toEqual(new Set(['good.com', 'another.good']));
    expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "bad@domain"');
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: ".invalid"');
  });

  it('should reject domains with leading/trailing hyphens or dots', () => {
    const input = '-bad.com, good.com., .start.com, end-.com, nice.org';
    const result = parseBlacklistedDomainsModule(input);

    expect(result).toEqual(new Set(['nice.org']));
    expect(mockLogger.warn).toHaveBeenCalledTimes(4);
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "-bad.com"');
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "good.com."');
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: ".start.com"');
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "end-.com"');
  });

  it('should not crash on non-string input', () => {
    expect(parseBlacklistedDomainsModule(123)).toEqual(new Set());
    expect(parseBlacklistedDomainsModule({})).toEqual(new Set());
    expect(parseBlacklistedDomainsModule([])).toEqual(new Set());
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });


  it('should handle duplicate valid domains by returning a set with unique entries', () => {
    const input = 'domain.com, example.org, domain.com, test.net, Example.org';
    const result = parseBlacklistedDomainsModule(input);
    
    expect(result).toEqual(new Set(['domain.com', 'example.org', 'test.net']));
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should correctly parse a mix of valid, invalid, and empty entries with various spacing', () => {
    const input = 'valid1.com , invalid@bad , valid2.org, , -invalid.net , final.co.uk ';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set(['valid1.com', 'valid2.org', 'final.co.uk']));
    expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "invalid@bad"');
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "-invalid.net"');
  });

  it('should return an empty set and log warnings if all domains are invalid', () => {
    const input = 'bad@domain, .invalid, -start.com, end-.org';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set());
    expect(mockLogger.warn).toHaveBeenCalledTimes(4);
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "bad@domain"');
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: ".invalid"');
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "-start.com"');
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "end-.org"');
  });

  it('should correctly handle domains with numbers and hyphens that are valid', () => {
    const input = 'my-site-123.com, 24x7support.net, domain-with-many-hyphens-and-numbers-123.info';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set([
      'my-site-123.com',
      '24x7support.net',
      'domain-with-many-hyphens-and-numbers-123.info'
    ]));
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });


  it('should log a warning for labels exceeding 63 characters and exclude them', () => {
    const longLabel64 = 'a'.repeat(64); 
    const input = `valid.com, ${longLabel64}.invalid.com, another.net`;
    const result = parseBlacklistedDomainsModule(input);

    expect(result).toEqual(new Set(['valid.com', 'another.net']));
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockLogger.warn).toHaveBeenCalledWith(`Invalid domain in blacklist config: "${longLabel64}.invalid.com"`);
  });

  it('should handle single domain input', () => {
    const input = 'single.domain.com';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set(['single.domain.com']));
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should handle trailing commas', () => {
    const input = 'domain.com, ';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set(['domain.com']));
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });
});