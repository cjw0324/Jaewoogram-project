// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../lib/auth/AuthProvider";

export default function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUserInfo } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("OAuth 콜백 처리 시작");

        // 명시적으로 사용자 정보 갱신 시도
        await fetchUserInfo();
        console.log("OAuth 콜백 - 사용자 정보 갱신 성공");

        setStatus("success");

        // 성공 상태 잠시 표시 후 리다이렉트
        setTimeout(() => {
          console.log("OAuth 콜백 - 리다이렉트 진행");
          router.push("/");
        }, 1500);
      } catch (error) {
        console.error("OAuth 콜백 처리 실패:", error);
        setStatus("error");
        setErrorMessage(
          "로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요."
        );
      }
    };

    handleCallback();
  }, [router, fetchUserInfo]);

  // 상태별 화면
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-red-500">❌</div>
          <h2 className="text-xl font-semibold mb-2">로그인 오류</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => router.push("/login")}
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 text-green-500">✅</div>
        <h2 className="text-xl font-semibold mb-2">로그인 성공!</h2>
        <p className="text-gray-600">잠시 후 자동으로 이동합니다.</p>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
