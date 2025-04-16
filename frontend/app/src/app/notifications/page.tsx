"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "../stores/notificationStore";

interface NotificationMessage {
  id?: number; // 서버에서 온 경우
  type: string;
  receiverId: number;
  senderId: number;
  senderNickname: string;
  data: Record<string, any>;
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
      default:
        return "새로운 알림이 도착했습니다.";
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">🔔 알림</h1>
        <div className="space-x-2 text-sm">
          <button
            onClick={handleMarkAllAsRead}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            모두 읽음 처리
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <p>알림이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n, i) => (
            <li
              key={`${n.type}-${n.senderId}-${i}`}
              onClick={() => handleNotificationClick(i, n)}
              className="p-3 border rounded shadow cursor-pointer hover:bg-gray-100 transition"
            >
              {renderMessage(n)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
