import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
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

let parseBlacklistedDomainsModule;

describe('parseBlacklistedDomains', () => {
  beforeAll(async () => {
   
    require.cache[loggerAbsolutePath] = { exports: mockLogger };


    const module = await vi.importActual('../../controllers/auth/domainBlacklist');
    parseBlacklistedDomainsModule = module.parseBlacklistedDomains;
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

  it('should return a set of valid domains', () => {
    const input = 'example.com, test.org, valid.net';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set(['example.com', 'test.org', 'valid.net']));
  });

  it('should trim spaces and convert to lowercase', () => {
    const input = '   Foo.COM , BAR.org ';
    const result = parseBlacklistedDomainsModule(input);
    expect(result).toEqual(new Set(['foo.com', 'bar.org']));
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