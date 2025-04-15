"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";

export default function Footer() {
  const { user } = useAuth();
  const pathname = usePathname();

  // 로그인 페이지나 회원가입 페이지에서는 푸터를 보여주지 않음
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  // 로그인하지 않은 경우 푸터 숨김
  if (!user) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="max-w-md mx-auto flex justify-between items-center h-14 px-6">
        <Link
          href="/"
          className={`flex flex-col items-center ${
            pathname === "/" ? "text-black" : "text-gray-500"
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">홈</span>
        </Link>

        <Link
          href="/users/search"
          className={`flex flex-col items-center ${
            pathname === "/users/search" ? "text-black" : "text-gray-500"
          }`}
        >
          <Search size={24} />
          <span className="text-xs mt-1">검색</span>
        </Link>

        <Link
          href="/posts/new"
          className={`flex flex-col items-center ${
            pathname.startsWith("/posts/new") ? "text-black" : "text-gray-500"
          }`}
        >
          <PlusSquare size={24} />
          <span className="text-xs mt-1">만들기</span>
        </Link>

        <Link
          href="/notifications"
          className={`flex flex-col items-center ${
            pathname === "/notifications" ? "text-black" : "text-gray-500"
          }`}
        >
          <Heart size={24} />
          <span className="text-xs mt-1">알림</span>
        </Link>

        <Link
          href={`/users/${user.id}`}
          className={`flex flex-col items-center ${
            pathname.startsWith(`/users/${user.id}`)
              ? "text-black"
              : "text-gray-500"
          }`}
        >
          <div
            className={`w-6 h-6 bg-gray-200 flex items-center justify-center rounded-full ${
              pathname.startsWith(`/users/${user.id}`)
                ? "border-2 border-black"
                : ""
            }`}
          >
            {user.nickname ? user.nickname.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="text-xs mt-1">프로필</span>
        </Link>
      </div>
    </footer>
  );
}
