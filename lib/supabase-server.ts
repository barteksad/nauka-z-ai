import { Database } from "@/supabase/types_db";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
// import { unstable_cache } from "next/cache";

export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });

export async function getSession() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
