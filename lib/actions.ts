import type { Database } from "@/supabase/types_db";

import type { SupabaseClient } from "@supabase/supabase-js";

import { Tables } from "@/supabase/types_db";

export async function getUserProductAndLimits(
  supabase: SupabaseClient<Database>
): Promise<{
  productId: string | null;
  userLimits: Tables<"usage_limits">;
}> {
  const getUserActiveProductQuery = supabase
    .from("subscriptions")
    .select(
      `
      prices (
        products (
          id
        )
      )`
    )
    .eq("status", "active")
    .limit(1);

  const { data: userProducts, error: error1 } = await getUserActiveProductQuery;
  if (error1) {
    console.error("Error getting user active products", error1);
  }

  let productId: string | null = null;
  if (userProducts) {
    productId = userProducts[0]?.prices?.products?.id ?? null;
  }

  const { data: userLimits, error: error2 } = await supabase
    .from("usage_limits")
    .select("*")
    .single();

  if (error2) {
    console.error("Error getting user limits", error2);
  }

  return { productId: productId, userLimits: userLimits! };
}

export async function isAdmin(
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  try {
    const { data: adminRow } = await supabase
      .from("admins")
      .select("*")
      .single();
    if (adminRow) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}
