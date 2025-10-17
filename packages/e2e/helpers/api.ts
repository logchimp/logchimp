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
  baseURL: _baseURL,
  email: _email,
  password: _password,
  isOwner,
}: UserSignupOptions): Promise<APIResponse> {
  const email = _email || faker.internet.email();
  const password = _password || "password";

  // custom base URL used for executing API calls and fallback to web base URL
  const baseURL = process.env.LOGCHIMP_API_URL || _baseURL;
  console.log('userSignup base url:', baseURL)

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
  baseURL: _baseURL,
  email,
  password,
}: UserLoginOptions): Promise<APIResponse> {
  // custom base URL used for executing API calls and fallback to web base URL
  const baseURL = process.env.LOGCHIMP_API_URL || _baseURL;
  console.log('userSignup base url:', baseURL)

  return await requestContext.post(`${baseURL}/api/v1/auth/login`, {
    data: {
      email,
      password,
    },
  });
}
