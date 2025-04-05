"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

      if (!isNewUser) {
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    }

    setLoading(false);
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">로그인 완료</h1>
        {loading ? (
          <div className="flex justify-center my-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-center mb-4">
              로그인이 완료되었습니다. 홈 화면으로 이동합니다.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                홈으로 이동
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">로딩 중...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
