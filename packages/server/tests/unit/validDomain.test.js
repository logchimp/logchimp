import { describe, it, expect } from 'vitest';

import { isValidDomain } from '../../controllers/auth/domainBlacklist'; 

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
    expect(isValidDomain('.example.com')).toBe(false); 
    expect(isValidDomain('example.com.')).toBe(false); 
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