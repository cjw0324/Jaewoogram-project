// src/app/auth/callback/[provider]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/auth/AuthProvider";
import { oauthProviders } from "../../../lib/auth/oauthConfig";

export default function OAuthCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkAuthStatus } = useAuth();

  const provider = params.provider as string;
  const code = searchParams.get("code");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!provider || !code) return;

    const handleCallback = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(
          `${apiBaseUrl}/auth/callback/${provider}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          // 토큰 저장
          localStorage.setItem("auth_token", data.token);
          setStatus("success");

          // 인증 상태 새로고침
          await checkAuthStatus();

          // 리다이렉트 URL이 있으면 그쪽으로, 없으면 홈으로
          const redirectUrl = localStorage.getItem("auth_redirect") || "/";
          localStorage.removeItem("auth_redirect"); // 사용 후 삭제

          // 잠시 후 리다이렉트
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1500);
        } else {
          const error = await response.json();
          setStatus("error");
          setErrorMessage(
            error.message || "로그인 처리 중 오류가 발생했습니다."
          );
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("로그인 처리 중 오류가 발생했습니다.");
      }
    };

    handleCallback();
  }, [provider, code, router, checkAuthStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {status === "loading" && (
        <>
          <div className="mb-4 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-2xl font-bold mb-2">로그인 처리 중...</h1>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mb-4 w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
          <h1 className="text-2xl font-bold mb-2">로그인 성공!</h1>
          <p className="text-gray-600">잠시 후 메인 페이지로 이동합니다.</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mb-4 w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">로그인 실패</h1>
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            다시 시도하기
          </button>
        </>
      )}
    </div>
  );
}
