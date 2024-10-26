import { getSession } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

import AuthUI from "@/components/AuthUI";

export default async function Page() {
  const session = await getSession();

  if (session) {
    return redirect("/",);
  }

  return (
    <div className="flex items-center justify-center md:h-screen h-full w-full">
      <AuthUI />
    </div>
  );
}
