"use client";

import { useSupabase } from "@/app/supabase-provider";
import { getURL } from "@/lib/utils";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";

export default function AuthUI() {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    const isDatkTheme = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDarkMode(isDatkTheme.matches);
  }, []);

  const { supabase } = useSupabase();
  return (
    <Auth
      supabaseClient={supabase}
      providers={[]}
      redirectTo={`${getURL()}api/auth/callback`}
      magicLink={false}
      appearance={{
        theme: ThemeSupa,
      }}
      theme={prefersDarkMode ? "dark" : "default"}
    />
  );
}
