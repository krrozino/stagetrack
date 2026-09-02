import { type NextRequest, NextResponse } from "next/server";

import { logout } from "@/features/auth/services/auth.service";

export async function POST(request: NextRequest) {
  const result = await logout();
  const redirectTo = new URL("/login", request.url);

  if (!result.ok) {
    redirectTo.searchParams.set("error", "signout_failed");
  }

  return NextResponse.redirect(redirectTo, { status: 303 });
}
