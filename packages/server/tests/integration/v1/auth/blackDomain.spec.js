import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import path from 'path';

const mockLogger = {
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
};

const loggerAbsolutePath = path.resolve(
  __dirname,
  '../../../../utils/logger.js' 
);

let isDomainBlacklisted;
let parseBlacklistedDomainsModule; 

describe('Integration: isDomainBlacklisted with LOGCHIMP_BLACKLISTED_DOMAINS and Logger', () => {
    let originalEnvBlacklistedDomains; 
    beforeAll(async () => { 
        originalEnvBlacklistedDomains = process.env.LOGCHIMP_BLACKLISTED_DOMAINS;

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';

        require.cache[loggerAbsolutePath] = { exports: mockLogger };

        vi.resetModules(); 

        const domainBlacklistModule = await vi.importActual('../../../../controllers/auth/domainBlacklist');

        isDomainBlacklisted = domainBlacklistModule.isDomainBlacklisted;
        parseBlacklistedDomainsModule = domainBlacklistModule.parseBlacklistedDomains; 
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

    afterAll(() => {
        if (originalEnvBlacklistedDomains !== undefined) {
            process.env.LOGCHIMP_BLACKLISTED_DOMAINS = originalEnvBlacklistedDomains;
        } else {
            delete process.env.LOGCHIMP_BLACKLISTED_DOMAINS;
        }
    });

    it('should correctly determine blacklisted status based on the configured environment variable', () => {
        expect(isDomainBlacklisted('user@example.com')).toBeTruthy();
        expect(isDomainBlacklisted('test@test.com')).toBeTruthy();
        expect(isDomainBlacklisted('admin@spam.com')).toBeTruthy();
        
        expect(isDomainBlacklisted('hello@good.com')).toBeFalsy();
        expect(isDomainBlacklisted('admin@other.org')).toBeFalsy();
        
        expect(mockLogger.warn).not.toHaveBeenCalled(); 
    });

    it('should log warnings for invalid domains defined in LOGCHIMP_BLACKLISTED_DOMAINS env variable', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'valid.com, invalid!.com, another.org, .start.net, long' + 'a'.repeat(60) + 'label.com';

        parseBlacklistedDomainsModule(process.env.LOGCHIMP_BLACKLISTED_DOMAINS);

        expect(mockLogger.warn).toHaveBeenCalledTimes(3); 
        expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "invalid!.com"');
        expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: ".start.net"');
        expect(mockLogger.warn).toHaveBeenCalledWith(`Invalid domain in blacklist config: "long${'a'.repeat(60)}label.com"`);

        expect(isDomainBlacklisted('user@valid.com')).toBeTruthy();
        expect(isDomainBlacklisted('user@invalid!.com')).toBeFalsy(); 
        expect(isDomainBlacklisted('user@another.org')).toBeTruthy();
        expect(isDomainBlacklisted('user@.start.net')).toBeFalsy();
        expect(isDomainBlacklisted('user@long' + 'a'.repeat(60) + 'label.com')).toBeFalsy();

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should correctly handle an empty LOGCHIMP_BLACKLISTED_DOMAINS env variable (no domains blacklisted)', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';

        expect(isDomainBlacklisted('user@example.com')).toBeFalsy();
        expect(isDomainBlacklisted('user@test.com')).toBeFalsy();
        expect(isDomainBlacklisted('any@domain.com')).toBeFalsy();
        
        expect(mockLogger.warn).not.toHaveBeenCalled(); 

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should handle email with invalid domain format itself (e.g., user@.com) not being blacklisted', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'test.com'; 
        
        expect(isDomainBlacklisted('user@.com')).toBeFalsy();
        expect(isDomainBlacklisted('user@invalid!')).toBeFalsy();
        
        expect(mockLogger.warn).not.toHaveBeenCalled(); 
    });


    it('should return false if LOGCHIMP_BLACKLISTED_DOMAINS environment variable is not set', () => {
        delete process.env.LOGCHIMP_BLACKLISTED_DOMAINS;
        
        mockLogger.warn.mockClear(); 

        expect(isDomainBlacklisted('user@anydomain.com')).toBeFalsy();
        expect(mockLogger.warn).not.toHaveBeenCalled(); 

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should correctly handle a blacklist with only one valid domain', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'singledomain.com';
        
        expect(isDomainBlacklisted('user@singledomain.com')).toBeTruthy();
        expect(isDomainBlacklisted('user@other.com')).toBeFalsy();
        expect(mockLogger.warn).not.toHaveBeenCalled();

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should correctly handle a blacklist with many valid domains', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'domain1.com, domain2.net, domain3.org, domain4.io, domain5.co';
        
        expect(isDomainBlacklisted('user@domain1.com')).toBeTruthy();
        expect(isDomainBlacklisted('user@domain3.org')).toBeTruthy();
        expect(isDomainBlacklisted('user@domain6.xyz')).toBeFalsy();
        expect(mockLogger.warn).not.toHaveBeenCalled();

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should be case insensitive for email domains', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'case.com';
        
        expect(isDomainBlacklisted('user@CASE.COM')).toBeTruthy();
        expect(isDomainBlacklisted('user@cAsE.cOm')).toBeTruthy();
        expect(mockLogger.warn).not.toHaveBeenCalled();

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should trim spaces from the email domain before checking blacklist', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'trim.com';
        
        expect(isDomainBlacklisted('user@ trim.com')).toBeTruthy();
        expect(isDomainBlacklisted('user@trim.com ')).toBeTruthy();
        expect(isDomainBlacklisted('user@ trim.com ')).toBeTruthy();
        expect(mockLogger.warn).not.toHaveBeenCalled();

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should not blacklist subdomains unless explicitly listed', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'parent.com';

        expect(isDomainBlacklisted('user@parent.com')).toBeTruthy();
        expect(isDomainBlacklisted('user@sub.parent.com')).toBeFalsy(); 
        expect(isDomainBlacklisted('user@another.sub.parent.com')).toBeFalsy();
        expect(mockLogger.warn).not.toHaveBeenCalled();

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should filter out invalid domains from the blacklist and log warnings', () => {
        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'valid1.com, invalid@domain, valid2.net, .badtld, good.org';
        
        parseBlacklistedDomainsModule(process.env.LOGCHIMP_BLACKLISTED_DOMAINS);

        expect(mockLogger.warn).toHaveBeenCalledTimes(2); 
        expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: "invalid@domain"');
        expect(mockLogger.warn).toHaveBeenCalledWith('Invalid domain in blacklist config: ".badtld"');

        expect(isDomainBlacklisted('user@valid1.com')).toBeTruthy();
        expect(isDomainBlacklisted('user@valid2.net')).toBeTruthy();
        expect(isDomainBlacklisted('user@good.org')).toBeTruthy();
        expect(isDomainBlacklisted('user@invalid@domain')).toBeFalsy(); 
        expect(isDomainBlacklisted('user@.badtld')).toBeFalsy();
        expect(isDomainBlacklisted('user@nonexistent.com')).toBeFalsy();

        process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
    });

    it('should return false for email without an @ symbol', () => {
        expect(isDomainBlacklisted('justanemail')).toBeFalsy();
        expect(mockLogger.warn).not.toHaveBeenCalled();
    });

   
    it('should return false for email with multiple @ symbols', () => {
        expect(isDomainBlacklisted('user@domain@example.com')).toBeFalsy();
        expect(mockLogger.warn).not.toHaveBeenCalled();
    });

   
    it('should return false for email with empty domain part', () => {
        expect(isDomainBlacklisted('user@')).toBeFalsy();
        expect(mockLogger.warn).not.toHaveBeenCalled();
    });
});
