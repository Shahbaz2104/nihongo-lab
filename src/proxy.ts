import { NextResponse, type NextRequest } from "next/server";

const MUTATING_POST_PATHS = new Set(["/api/review", "/api/cards"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "POST" && MUTATING_POST_PATHS.has(pathname)) {
    const token = process.env.API_TOKEN;
    if (!token) {
      return NextResponse.next();
    }
    if (request.headers.get("x-api-token") !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
