"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AuthCallbackHandlerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const isNewUser = searchParams.get("isNewUser") === "true";
    const userRole = searchParams.get("userRole");

    if (accessToken) {
      localStorage.setItem("auth_access_token", accessToken);

      if (refreshToken) {
        localStorage.setItem("auth_refresh_token", refreshToken);
      }

      if (userRole) {
        localStorage.setItem("auth_user_role", userRole);
      }

      if (isNewUser) {
        router.push("/nickname-registration");
      } else {
        const redirectUrl = localStorage.getItem("auth_redirect") || "/";
        localStorage.removeItem("auth_redirect");
        router.push(redirectUrl);
      }
    }
  }, [searchParams, router]);

  return null;
}

export default function AuthCallbackHandler() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackHandlerInner />
    </Suspense>
  );
}
