import { NextResponse } from "next/server";
import { getSession } from "@/lib/supabase-server";

import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(req: NextRequest) {
  const path = new URL(req.url).pathname;
  const session = await getSession();
  console.log(path);
  if (session && path === "/auth") {
    return NextResponse.redirect(new URL("/exam", req.url));
  } else if (!session && path === "/exam") {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}
