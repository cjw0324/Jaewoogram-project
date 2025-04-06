"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthProvider";

export default function SignUpClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchUserInfo } = useAuth();

  const isNewUser = searchParams.get("isNewUser") === "true";
  const userRole = searchParams.get("userRole");

  const [redirecting, setRedirecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("인증 상태 확인 중...");

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (redirecting) return;

      setStatusMessage("인증 상태 확인 중...");
      console.log("sign-up 페이지 - 인증 상태 확인 시작");

      try {
        await fetchUserInfo();

        setRedirecting(true);

        if (isNewUser) {
          setStatusMessage("닉네임 등록 페이지로 이동합니다...");
          setTimeout(() => {
            router.push("/nickname-registration");
          }, 1000);
        } else {
          setStatusMessage("메인 페이지로 이동합니다...");
          const redirectUrl = localStorage.getItem("auth_redirect") || "/";
          localStorage.removeItem("auth_redirect");

          setTimeout(() => {
            router.push(redirectUrl);
          }, 1000);
        }
      } catch (error: any) {
        console.error("인증 상태 확인 실패:", error);

        if (error.status === 401 || error.status === 403) {
          setStatusMessage("인증에 실패했습니다. 다시 로그인해주세요.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setStatusMessage("일시적인 오류가 발생했습니다. 다시 시도해주세요.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      }
    };

    checkAuthAndRedirect();
  }, [fetchUserInfo, isNewUser, router, redirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900">
          {isNewUser ? "가입이 완료되었습니다!" : "로그인이 완료되었습니다!"}
        </h2>

        <p className="text-sm text-gray-600 mt-2">{statusMessage}</p>

        <div className="mt-4">
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200">
              <div className="animate-pulse w-full h-full bg-green-500"></div>
            </div>
          </div>
        </div>

        {!isNewUser && !redirecting && (
          <button
            onClick={() => {
              const redirectUrl = localStorage.getItem("auth_redirect") || "/";
              localStorage.removeItem("auth_redirect");
              router.push(redirectUrl);
            }}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            지금 바로 이동
          </button>
        )}
      </div>
    </div>
  );
}
