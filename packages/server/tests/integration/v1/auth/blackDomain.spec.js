import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
const supertest = require('supertest');
const app = require('../../../../app');
const database = require('../../../../database');
const { hashPassword } = require('../../../../utils/password');
import { v4 as uuidv4 } from 'uuid';

import passwordReset from '../../../../services/auth/passwordReset';
vi.mock('../../../../services/auth/passwordReset', () => {
  return {
    __esModule: true,
    default: vi.fn().mockResolvedValue(true),
  };
});

describe('API Endpoints - Domain Blacklist Integration', () => {
  let originalEnvBlacklistedDomains;
  const testEmailPrefix = 'testuser_blacklist';
  const testPassword = 'SecurePassword123!';

  beforeAll(async () => {
    originalEnvBlacklistedDomains = process.env.LOGCHIMP_BLACKLISTED_DOMAINS;

    await database('settings')
      .update({
        allowSignup: true,
      });
  });

  afterAll(async () => {
    if (originalEnvBlacklistedDomains !== undefined) {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = originalEnvBlacklistedDomains;
    } else {
      delete process.env.LOGCHIMP_BLACKLISTED_DOMAINS;
    }

    await database('users')
      .where('email', 'like', `${testEmailPrefix}%`)
      .del();
  });

  beforeEach(async () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';

    await database('users')
      .where('email', 'like', `${testEmailPrefix}%`)
      .del();

    await database('settings').update({ allowSignup: true });

    passwordReset.mockClear();
  });

  describe('POST /api/v1/auth/signup - Domain Blacklist', () => {

    it('should prevent signup for a blacklisted domain', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'blocked.com';
      const email = `${testEmailPrefix}_signup_1@blocked.com`;
      const username = 'blockeduser_signup_1';

      const response = await supertest(app)
        .post('/api/v1/auth/signup')
        .send({
          email,
          username,
          password: testPassword,
          confirmPassword: testPassword,
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('EMAIL_DOMAIN_BLACKLISTED');
      expect(response.body.message).toBe('Email domain is not allowed to sign up.');
    });

    it('should allow signup for a non-blacklisted domain', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'other-blocked.com';
      const email = `${testEmailPrefix}_signup_2@allowed.com`;
      const username = 'alloweduser_signup_2';

      const response = await supertest(app)
        .post('/api/v1/auth/signup')
        .send({
          email,
          username,
          password: testPassword,
          confirmPassword: testPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(email);
    });

    it('should return EMAIL_INVALID for malformed emails before blacklist check', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'blocked.com';
      const email = 'malformed@';
      const username = 'malformeduser';

      const response = await supertest(app)
        .post('/api/v1/auth/signup')
        .send({
          email,
          username,
          password: testPassword,
          confirmPassword: testPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('EMAIL_INVALID');
    });

    it('should return PASSWORD_MISSING if password is not provided', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';
      const email = `${testEmailPrefix}_signup_no_pass@example.com`;
      const username = 'nopassuser';

      const response = await supertest(app)
        .post('/api/v1/auth/signup')
        .send({
          email,
          username,
          password: '',
          confirmPassword: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('PASSWORD_MISSING');
    });
  });

  describe('POST /api/v1/auth/login - Domain Blacklist', () => {
    const blacklistedLoginEmail = `${testEmailPrefix}_login_1@blocked-login.com`;
    const blacklistedLoginPassword = 'LoginPassword123';
    let blacklistedUser;

    beforeEach(async () => {

      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';

      const hashedPassword = await hashPassword(blacklistedLoginPassword);
      const [user] = await database('users').insert({
        email: blacklistedLoginEmail,
        username: 'blockedloginuser',
        password: hashedPassword,
        userId: uuidv4(),
        name: null,
        avatar: null,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning('*');
      blacklistedUser = user;

      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'blocked-login.com';
    });

    afterEach(async () => {
      if (blacklistedUser && blacklistedUser.userId) {
        await database('users').where({ userId: blacklistedUser.userId }).del();
      }
    });

    it('should prevent login for an already registered user with a blacklisted domain', async () => {
      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({
          email: blacklistedLoginEmail,
          password: blacklistedLoginPassword,
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('EMAIL_DOMAIN_BLACKLISTED');
      expect(response.body.message).toBe('Email domain is not allowed to login.');
    });

    it('should allow login for a non-blacklisted user', async () => {
      const allowedLoginEmail = `${testEmailPrefix}_login_allowed@normal.com`;
      const allowedLoginPassword = 'NormalPassword123';
      const hashedPassword = await hashPassword(allowedLoginPassword);

      const [allowedUser] = await database('users').insert({
        email: allowedLoginEmail,
        username: 'allowedloginuser',
        password: hashedPassword,
        userId: uuidv4(),
        name: null,
        avatar: null,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning('*');

      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'someother.com';

      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({
          email: allowedLoginEmail,
          password: allowedLoginPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(allowedLoginEmail);

      await database('users').where({ userId: allowedUser.userId }).del();
    });

    it('should return USER_BLOCKED if user is blocked (precedes blacklist check)', async () => {
      const blockedEmail = `${testEmailPrefix}_blocked@example.com`;
      const blockedPassword = 'BlockedUserPass';
      const hashedPassword = await hashPassword(blockedPassword);

      const [blockedUser] = await database('users').insert({
        email: blockedEmail,
        username: 'blockeduser',
        password: hashedPassword,
        userId: uuidv4(),
        name: null,
        avatar: null,
        isBlocked: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning('*');

      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com';

      const response = await supertest(app)
        .post('/api/v1/auth/login')
        .send({
          email: blockedEmail,
          password: blockedPassword,
        });

      expect(response.statusCode).toEqual(403);
      expect(response.body.code).toEqual("USER_BLOCKED");

      await database('users').where({ userId: blockedUser.userId }).del();
    });

    it('should return PASSWORD_MISSING if password is not provided for login', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';
      const email = `${testEmailPrefix}_login_no_pass@example.com`;
      const username = 'login_nopassuser';
      const hashedPassword = await hashPassword(testPassword);

      const [tempUser] = await database('users').insert({
        email,
        username,
        password: hashedPassword,
        userId: uuidv4(),
        name: null, avatar: null, isBlocked: false, createdAt: new Date(), updatedAt: new Date(),
      }).returning('*');

      const response = await supertest(app).post("/api/v1/auth/login").send({
        email: email,
        password: "",
      });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("PASSWORD_MISSING");

      await database('users').where({ userId: tempUser.userId }).del();
    });

    it('should return INCORRECT_PASSWORD for wrong password', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';
      const email = `${testEmailPrefix}_login_wrong_pass@example.com`;
      const username = 'login_wrongpassuser';
      const hashedPassword = await hashPassword(testPassword);

      const [tempUser] = await database('users').insert({
        email,
        username,
        password: hashedPassword,
        userId: uuidv4(),
        name: null, avatar: null, isBlocked: false, createdAt: new Date(), updatedAt: new Date(),
      }).returning('*');

      const response = await supertest(app).post("/api/v1/auth/login").send({
        email: email,
        password: "wrongPassword",
      });

      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.status).toBe(403);
      expect(response.body.code).toBe("INCORRECT_PASSWORD");

      await database('users').where({ userId: tempUser.userId }).del();
    });
  });

  describe('POST /api/v1/auth/password/reset - Initial Request Blacklist', () => {
    const resetEmailBlacklisted = `${testEmailPrefix}_pwdreset_blocked@blocked-for-reset.com`;
    const resetEmailAllowed = `${testEmailPrefix}_pwdreset_allowed@allowed-for-reset.com`;
    let userForBlacklistedReset;
    let existingUserForAllowedReset;

    beforeEach(async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';

      const hashedPasswordBlacklisted = await hashPassword(testPassword);
      const [blockedUser] = await database('users').insert({
        email: resetEmailBlacklisted,
        username: 'pwdresetblockeduser',
        password: hashedPasswordBlacklisted,
        userId: uuidv4(),
        name: null, avatar: null, isBlocked: false, createdAt: new Date(), updatedAt: new Date(),
      }).returning('*');
      userForBlacklistedReset = blockedUser;

      const hashedPasswordAllowed = await hashPassword(testPassword);
      const [allowedUser] = await database('users').insert({
        email: resetEmailAllowed,
        username: 'pwdresetalloweduser',
        password: hashedPasswordAllowed,
        userId: uuidv4(),
        name: null, avatar: null, isBlocked: false, createdAt: new Date(), updatedAt: new Date(),
      }).returning('*');
      existingUserForAllowedReset = allowedUser;
    });

    afterEach(async () => {
      if (userForBlacklistedReset && userForBlacklistedReset.userId) {
        await database('users').where({ userId: userForBlacklistedReset.userId }).del();
      }
      if (existingUserForAllowedReset && existingUserForAllowedReset.userId) {
        await database('users').where({ userId: existingUserForAllowedReset.userId }).del();
      }
    });

    it('should prevent initial password reset request for a blacklisted domain (user exists)', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'blocked-for-reset.com';

      const response = await supertest(app)
        .post('/api/v1/auth/password/reset')
        .set('Origin', 'http://localhost:3000')
        .send({ email: resetEmailBlacklisted });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('DOMAIN_BLACKLISTED');
      expect(response.body.message).toBe('The domain of the email is not allowed.'); 
    });


    it('should return USER_NOT_FOUND if email is not registered, even if domain is not blacklisted', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = ''; 

      const nonExistentEmail = `${testEmailPrefix}_nonexistent@nonexistent.com`;

      const response = await supertest(app)
        .post('/api/v1/auth/password/reset')
        .set('Origin', 'http://localhost:3000') 
        .send({ email: nonExistentEmail });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('USER_NOT_FOUND'); 
    });

    it('should return EMAIL_INVALID for malformed email for reset request', async () => {
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'blocked-for-reset.com';

      const response = await supertest(app)
        .post('/api/v1/auth/password/reset')
        .set('Origin', 'http://localhost:3000')
        .send({ email: 'malformed@@email' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('EMAIL_INVALID');
    });

  });

  describe('POST /api/v1/auth/password-reset - Authenticated Reset Blacklist (Using req.user)', () => {
      it('should NOT be found as the route is not defined', async () => {
        const response = await supertest(app)
            .post('/api/v1/auth/password-reset')
            .send({});
        expect(response.status).toBe(404);
      });
  });
});