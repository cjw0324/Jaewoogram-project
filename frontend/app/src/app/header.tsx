"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Home, Search, PlusSquare, Heart, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNotificationStore } from "./stores/notificationStore";

interface NotificationMessage {
  id?: number;
  type: string;
  receiverId: number;
  senderId: number;
  senderNickname: string;
  data: Record<string, any>;
  createdAt: string;
}

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const hasUnread = useNotificationStore((state) => state.hasUnread);
  const setUnread = useNotificationStore((state) => state.setUnread);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // ✅ 알림 페이지 진입 시 빨간 점 제거
  useEffect(() => {
    if (pathname === "/notifications") {
      setUnread(false);
      return;
    }

    // ✅ 로그인된 경우 서버 unread 알림 확인
    const fetchUnread = async () => {
      if (!user) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/unread`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const existing: NotificationMessage[] = JSON.parse(
            localStorage.getItem("notifications") || "[]"
          );

          const makeHash = (n: NotificationMessage) =>
            `${n.type}-${n.senderId}-${JSON.stringify(n.data)}`;
          const existingHashes = new Set(existing.map(makeHash));

          const newOnly = data
            .map((n: any) => ({
              id: n.id,
              type: n.type,
              receiverId: n.receiverId,
              senderId: n.senderId,
              senderNickname: n.senderNickname,
              data: JSON.parse(n.data),
              createdAt: n.createdAt,
            }))
            .filter((n) => !existingHashes.has(makeHash(n)));

          if (newOnly.length > 0) {
            const merged = [...newOnly, ...existing];
            localStorage.setItem("notifications", JSON.stringify(merged));
            setUnread(true);
          }
        }
      } catch (e) {
        console.error("❌ 초기 알림 동기화 실패", e);
      }
    };

    fetchUnread();
  }, [pathname, user, setUnread]);

  if (isAuthPage) return null;

  if (!user) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">
            Jaewoogram
          </Link>
          <Link href="/login" className="text-blue-500 text-sm font-semibold">
            로그인
          </Link>
        </div>
      </header>
    );
  }

  const handleProfileClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-2">
      <div className="max-w-md mx-auto flex justify-between items-center h-14">
        {/* 로고 */}
        <Link href="/" className="font-bold text-xl">
          Jaewoogram
        </Link>

        {/* 네비게이션 아이콘 */}
        <nav className="flex items-center space-x-5">
          <Link
            href="/"
            className={pathname === "/" ? "text-black" : "text-gray-500"}
          >
            <Home size={24} />
          </Link>
          <Link
            href="/users/search"
            className={
              pathname === "/users/search" ? "text-black" : "text-gray-500"
            }
          >
            <Search size={24} />
          </Link>
          <Link
            href="/posts/new"
            className={
              pathname.startsWith("/posts/new") ? "text-black" : "text-gray-500"
            }
          >
            <PlusSquare size={24} />
          </Link>
          <Link
            href="/notifications"
            className={`relative ${
              pathname === "/notifications" ? "text-black" : "text-gray-500"
            }`}
            onClick={() => setUnread(false)}
          >
            <Heart size={24} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full" />
            )}
          </Link>

          {/* 프로필 */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className={`rounded-full overflow-hidden ${
                pathname.startsWith("/users/" + user.id)
                  ? "border-2 border-black"
                  : ""
              }`}
            >
              <div className="w-7 h-7 bg-gray-200 flex items-center justify-center rounded-full">
                {user.nickname ? user.nickname.charAt(0).toUpperCase() : "U"}
              </div>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <Link
                    href={`/users/${user.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <User size={16} className="mr-2" />
                    프로필
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
