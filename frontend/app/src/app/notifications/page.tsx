"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "../stores/notificationStore";
import { renderTimeAgo as formatTimeAgo } from "../utils/time";

interface NotificationMessage {
  id?: number; // 서버에서 온 경우
  type: string;
  receiverId: number;
  senderId: number;
  senderNickname: string;
  data: Record<string, any>;
  createdAt: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const setUnread = useNotificationStore((state) => state.setUnread);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const local: NotificationMessage[] = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/unread`,
          { credentials: "include" }
        );
        const server = await res.json();

        const formatted: NotificationMessage[] = server.map((n: any) => ({
          id: n.id,
          type: n.type,
          receiverId: n.receiverId,
          senderId: n.senderId,
          senderNickname: n.senderNickname,
          data: JSON.parse(n.data),
          createdAt: n.createdAt,
        }));

        // 중복 제거
        const makeHash = (n: NotificationMessage) =>
          `${n.type}-${n.senderId}-${JSON.stringify(n.data)}`;
        const localHashes = new Set(local.map(makeHash));
        const newOnly = formatted.filter((n) => !localHashes.has(makeHash(n)));

        const merged = [...newOnly, ...local];
        setNotifications(merged);
        localStorage.setItem("notifications", JSON.stringify(merged));
      } catch (e) {
        console.error("❌ 서버 알림 요청 실패", e);
        setNotifications(local);
      }

      setUnread(false);
    };

    load();
  }, []);

  const handleNotificationClick = async (
    index: number,
    n: NotificationMessage
  ) => {
    // 1️⃣ 로컬에서 제거
    const newList = [...notifications];
    newList.splice(index, 1);
    setNotifications(newList);
    localStorage.setItem("notifications", JSON.stringify(newList));

    // 2️⃣ 서버 읽음 처리
    if (n.id) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${n.id}/read`,
          { method: "PATCH", credentials: "include" }
        );
      } catch (e) {
        console.error("❌ 알림 읽음 처리 실패", e);
      }
    }

    // 3️⃣ 이동
    switch (n.type) {
      case "POST_LIKE":
      case "COMMENT_LIKE":
      case "COMMENT_ADDED":
      case "REPLY_ADDED":
        router.push(`/posts/${n.data.postId}`);
        break;
      case "FOLLOW":
      case "FOLLOW_REQUEST":
      case "FOLLOW_ACCEPTED":
        router.push(`/users/${n.senderId}`);
        break;
      case "DM":
        router.push(`/chat/${n.data.roomId}`);
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications([]);
    localStorage.removeItem("notifications");

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/read-all`,
        { method: "PATCH", credentials: "include" }
      );
    } catch (e) {
      console.error("❌ 전체 읽음 처리 실패", e);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "POST_LIKE":
      case "COMMENT_LIKE":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-red-500"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
        );
      case "COMMENT_ADDED":
      case "REPLY_ADDED":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-blue-500"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      case "FOLLOW":
      case "FOLLOW_REQUEST":
      case "FOLLOW_ACCEPTED":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-green-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-500"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
        );
    }
  };

  const renderMessage = (n: NotificationMessage) => {
    switch (n.type) {
      case "POST_LIKE":
        return `${n.senderNickname}님이 "${n.data.title}" 게시글을 좋아했습니다.`;
      case "COMMENT_LIKE":
        return `${n.senderNickname}님이 댓글을 좋아했습니다: "${n.data.comment}"`;
      case "COMMENT_ADDED":
        return `${n.senderNickname}님이 댓글을 남겼습니다: "${n.data.comment}"`;
      case "REPLY_ADDED":
        return `${n.senderNickname}님이 대댓글을 남겼습니다: "${n.data.comment}"`;
      case "FOLLOW_REQUEST":
        return `${n.senderNickname}님이 팔로우 요청을 보냈습니다.`;
      case "FOLLOW":
        return `${n.senderNickname}님이 회원님을 팔로우했습니다.`;
      case "FOLLOW_ACCEPTED":
        return `${n.senderNickname}님이 팔로우 요청을 수락했습니다.`;
      case "DM":
        return `${n.senderNickname}님이 DM을 보냈습니다 : "${n.data.content}"`;
      default:
        return "새로운 알림이 도착했습니다.";
    }
  };

  const renderTimeAgo = (createdAt: string | undefined): string => {
    if (!createdAt) return ""; // 혹시 undefined로 올 수 있으니까 예외 처리
    return formatTimeAgo(createdAt);
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-lg font-semibold">알림</h1>
          <button
            onClick={handleMarkAllAsRead}
            className="text-blue-500 text-sm font-medium"
          >
            모두 읽음 처리
          </button>
        </div>
      </div>

      {/* 알림 목록 */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-gray-400"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <p className="text-gray-500 text-center text-sm">알림이 없습니다.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((n, i) => (
            <div
              key={`${n.type}-${n.senderId}-${i}`}
              onClick={() => handleNotificationClick(i, n)}
              className="flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {/* 프로필 아이콘 또는 알림 타입 아이콘 */}
              <div className="mr-3 mt-1">{renderIcon(n.type)}</div>

              {/* 알림 내용 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 line-clamp-2">
                  <span className="font-semibold">{n.senderNickname}</span>{" "}
                  {n.type === "POST_LIKE" &&
                    "님이 회원님의 게시물을 좋아합니다."}
                  {n.type === "COMMENT_LIKE" &&
                    "님이 회원님의 댓글을 좋아합니다."}
                  {n.type === "COMMENT_ADDED" && "님이 댓글을 남겼습니다:"}
                  {n.type === "REPLY_ADDED" && "님이 대댓글을 남겼습니다:"}
                  {n.type === "FOLLOW_REQUEST" &&
                    "님이 팔로우 요청을 보냈습니다."}
                  {n.type === "FOLLOW" &&
                    "님이 회원님을 팔로우하기 시작했습니다."}
                  {n.type === "FOLLOW_ACCEPTED" &&
                    "님이 팔로우 요청을 수락했습니다."}
                  {n.type === "DM" && "님이 DM을 보냈습니다."}
                </p>

                {/* 댓글 내용이 있는 경우 보여주기 */}
                {(n.type === "COMMENT_ADDED" || n.type === "REPLY_ADDED") &&
                  n.data.comment && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {n.data.comment}
                    </p>
                  )}

                {/* 시간 표시 */}
                <p className="text-xs text-gray-400 mt-1">
                  {renderTimeAgo(n.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
