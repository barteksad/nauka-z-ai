import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "./supabase/types_db";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(req: NextRequest) {
  const path = new URL(req.url).pathname;
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const isUser = (await supabase.auth.getSession()).data.session?.user;
  if (isUser && path === "/auth") {
    return NextResponse.redirect(new URL("/exam", req.url));
  } else if (!isUser && path === "/exam") {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}
