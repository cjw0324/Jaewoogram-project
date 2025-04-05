"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SocialLogin from "../components/SocialLogin";
import { useAuth } from "../../lib/auth/AuthProvider";

function LoginContent() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirect || "/");
    }

    if (redirect) {
      localStorage.setItem("auth_redirect", redirect);
    }
  }, [isAuthenticated, loading, redirect, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
        <p className="text-gray-600 text-center mb-8">
          소셜 계정으로 간편하게 로그인하세요
        </p>
        <SocialLogin />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">로딩 중...</div>}>
      <LoginContent />
    </Suspense>
  );
}
