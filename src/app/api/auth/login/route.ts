import type { LoginData, LoggedInUser } from "@/features/auth/types";
import type { ApiResponse } from "@/lib/api/generic-response.types";
import axios from "axios";
import { NextResponse } from "next/server";

type LoginClientResponse = {
  success: true;
  data: { loggedInUser: LoggedInUser };
  message?: string;
};

export async function POST(request: Request) {
  try {
    const credentials = await request.json();
    const apiBaseUrl =
      process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      return NextResponse.json(
        { message: "API_BASE_URL is not defined" },
        { status: 500 },
      );
    }

    const { data: result } = await axios.post<ApiResponse<LoginData>>(
      `${apiBaseUrl.replace(/\/$/, "")}/auth/signin`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      },
    );

    const { accessToken, refreshToken, refreshTokenId, loggedInUser } =
      result.data;

    // if (loggedInUser.role !== "admin") {
    //   return NextResponse.json(
    //     { message: "Admin access required" },
    //     { status: 403 },
    //   );
    // }

    const body: LoginClientResponse = {
      success: true,
      data: { loggedInUser },
      message: result.message,
    };

    const response = NextResponse.json(body);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    response.cookies.set("accessToken", accessToken, {
      ...cookieOptions,
      path: "/",
    });
    response.cookies.set("refreshToken", refreshToken, {
      ...cookieOptions,
      path: "/api/auth",
    });
    response.cookies.set("refreshTokenId", refreshTokenId, {
      ...cookieOptions,
      path: "/api/auth",
    });

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Login failed";

      return NextResponse.json({ message }, { status });
    }

    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
