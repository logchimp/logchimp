import type { APIRequestContext } from "@playwright/test";
import { faker } from "@faker-js/faker";
import type { IAuthSignupResponseBody } from "@logchimp/types";

interface UserSignupOptions {
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
}: UserSignupOptions): Promise<{
  user: IAuthSignupResponseBody["user"];
}> {
  const email = _email || faker.internet.email();
  const password = _password || "password";

  const res = await requestContext.post(`${baseURL}/api/v1/auth/signup`, {
    data: {
      email,
      password,
    },
  });

  const body = await res.json() as IAuthSignupResponseBody;

  return {
    user: body.user,
  };
}
