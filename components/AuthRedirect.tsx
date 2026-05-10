"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Supabase always redirects to site_url (root). This component catches the
// #access_token=...&type=recovery hash and sends the user to /set-password
// so they can actually set their password.
export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (
      hash.includes("type=recovery") &&
      hash.includes("access_token") &&
      pathname !== "/set-password"
    ) {
      router.replace("/set-password" + hash);
    }
  }, [router, pathname]);

  return null;
}
