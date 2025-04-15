"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthProvider";
import { Check } from "lucide-react";

export default function SignUpClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchUserInfo } = useAuth();

  const isNewUser = searchParams.get("isNewUser") === "true";
  const userRole = searchParams.get("userRole");

  const [redirecting, setRedirecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("인증 상태 확인 중...");
  const [progress, setProgress] = useState(0);

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

          // 진행 상태 애니메이션
          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            currentProgress += 1;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
              clearInterval(progressInterval);
              router.push("/nickname-registration");
            }
          }, 10);
        } else {
          setStatusMessage("메인 페이지로 이동합니다...");
          const redirectUrl = localStorage.getItem("auth_redirect") || "/";
          localStorage.removeItem("auth_redirect");

          // 진행 상태 애니메이션
          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            currentProgress += 1;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
              clearInterval(progressInterval);
              router.push(redirectUrl);
            }
          }, 10);
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

  const handleManualRedirect = () => {
    const redirectUrl = localStorage.getItem("auth_redirect") || "/";
    localStorage.removeItem("auth_redirect");
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* 로고 */}
        <div className="flex justify-center mb-6">
          <div className="text-4xl font-semibold font-serif italic">
            Jaewoogram
          </div>
        </div>

        {/* 완료 아이콘 */}
        <div className="mx-auto w-20 h-20 flex items-center justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                <Check size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {isNewUser ? "가입이 완료되었습니다!" : "로그인이 완료되었습니다!"}
        </h2>

        <p className="text-sm text-gray-500 mb-6">{statusMessage}</p>

        {/* 진행 상태 바 */}
        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-pink-500 h-full rounded-full"
            style={{ width: `${progress}%`, transition: "width 0.1s ease" }}
          ></div>
        </div>

        {/* 수동 이동 버튼 */}
        {!isNewUser && !redirecting && (
          <button
            onClick={handleManualRedirect}
            className="w-full py-2.5 bg-blue-500 text-white rounded-md text-sm font-medium"
          >
            지금 바로 이동
          </button>
        )}

        {/* 추가 정보 */}
        <div className="mt-10 text-xs text-gray-400">
          <p>계정 활동 및 보안을 위해 로그인 정보가 저장되었습니다.</p>
        </div>
      </div>

      {/* 푸터 */}
      <div className="mt-auto w-full text-center py-6">
        <p className="text-xs text-gray-400">© 2025 Instagram Clone</p>
      </div>
    </div>
  );
}
