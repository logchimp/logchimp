import type { APIRequestContext, APIResponse } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { SITE_NAME } from "./constants";

interface UserSignupOptions {
  requestContext: APIRequestContext;
  baseURL: string;
  email?: string;
  password?: string;
  isOwner?: boolean;
}

interface UserLoginOptions {
  requestContext: APIRequestContext;
  baseURL: string;
  email?: string;
  password?: string;
}

export async function userSignup({
  requestContext,
  baseURL,
  email: _email,
  password: _password,
  isOwner,
}: UserSignupOptions): Promise<APIResponse> {
  const email = _email || faker.internet.email();
  const password = _password || "password";

  const url = isOwner
    ? `${baseURL}/api/v1/auth/setup`
    : `${baseURL}/api/v1/auth/signup`;

  const data = isOwner
    ? {
        siteTitle: SITE_NAME,
        name: faker.person.fullName(),
        email,
        password,
      }
    : {
        email,
        password,
      };

  return await requestContext.post(url, { data });
}

export async function userLogin({
  requestContext,
  baseURL,
  email,
  password,
}: UserLoginOptions): Promise<APIResponse> {
  return await requestContext.post(`${baseURL}/api/v1/auth/login`, {
    data: {
      email,
      password,
    },
  });
}
