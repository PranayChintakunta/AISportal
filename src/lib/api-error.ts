import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}