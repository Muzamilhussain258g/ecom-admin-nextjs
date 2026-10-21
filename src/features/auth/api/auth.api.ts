import type { LoggedInUser } from "@/features/auth/types";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export type LoginCredentials = {
  email: string;
  password: string;
};

type LoginSuccessBody = {
  success: true;
  data: { loggedInUser: LoggedInUser };
  message?: string;
};

type LoginErrorBody = {
  message?: string;
};

export const authApi = {
  /** Same-origin login; JWT is set as HttpOnly cookie by the API route. */
  login: async (credentials: LoginCredentials): Promise<LoggedInUser> => {
    const res = await fetch(API_ENDPOINTS.auth.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const body = (await res.json()) as LoginSuccessBody | LoginErrorBody;

    if (!res.ok) {
      throw new Error(
        "message" in body && body.message ? body.message : "Login failed",
      );
    }

    return (body as LoginSuccessBody).data.loggedInUser;
  },
};
