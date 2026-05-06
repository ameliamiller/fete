import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.set("fete_host", "", { maxAge: 0, path: "/" });
  return response;
}
