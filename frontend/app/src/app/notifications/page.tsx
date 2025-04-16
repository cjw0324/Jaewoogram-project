"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { useNotificationStore } from "../stores/notificationStore";

interface NotificationMessage {
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
    const stored = localStorage.getItem("notifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
    setUnread(false); // 🔕 알림 읽음 처리
  }, []);

  const handleNotificationClick = (
    clickedIndex: number,
    n: NotificationMessage
  ) => {
    // 🔁 클릭된 알림 제거
    const newList = [...notifications];
    newList.splice(clickedIndex, 1);
    setNotifications(newList);
    localStorage.setItem("notifications", JSON.stringify(newList));

    // 🚀 이동
    switch (n.type) {
      case "POST_LIKE":
      case "COMMENT_LIKE":
      case "COMMENT_ADDED":
      case "REPLY_ADDED":
        router.push(`/posts/${n.data.postId}`);
        break;
      case "FOLLOW_REQUEST":
      case "FOLLOW_ACCEPTED":
        router.push(`/users/${n.senderId}`);
        break;
      case "FOLLOW":
        router.push(`/users/${n.senderId}`);
        break;
      default:
        break;
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
      <h1 className="text-xl font-bold mb-4">🔔 알림</h1>
      {notifications.length === 0 ? (
        <p>알림이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n, i) => (
            <li
              key={i}
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
