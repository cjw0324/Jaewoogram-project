"use client";

// src/app/components/AuthCallbackHandler.tsx
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * 인증 콜백 파라미터를 처리하는 컴포넌트
 * URL 쿼리 파라미터에서 토큰 정보를 추출하여 저장
 */
export default function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // URL 쿼리 파라미터에서 정보 추출
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const isNewUser = searchParams.get("isNewUser") === "true";
    const userRole = searchParams.get("userRole");

    // 토큰이 있으면 로컬 스토리지에 저장
    if (accessToken) {
      localStorage.setItem("auth_access_token", accessToken);

      if (refreshToken) {
        localStorage.setItem("auth_refresh_token", refreshToken);
      }

      if (userRole) {
        localStorage.setItem("auth_user_role", userRole);
      }

      // 신규 사용자인 경우 추가 정보 입력 페이지로 이동할 수 있음
      if (isNewUser) {
        // 신규 사용자 처리 (필요한 경우)
        router.push("/user/profile-setup");
      } else {
        // 기존 사용자는 홈 또는 이전 페이지로 리다이렉트
        const redirectUrl = localStorage.getItem("auth_redirect") || "/";
        localStorage.removeItem("auth_redirect"); // 사용 후 삭제

        // URL에서 토큰 정보 제거 (보안상 이유로)
        router.push(redirectUrl);
      }
    }
  }, [searchParams, router]);

  // 이 컴포넌트는 아무것도 렌더링하지 않음
  return null;
}
