"use client";

import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

type ChatMessage = {
  roomId: string;
  senderId: number;
  nickname: string;
  content: string;
  messageType: string;
  timestamp: string;
};

export default function ChatPage() {
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId] = useState("room-1");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // 먼저 사용자 정보를 불러온다
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`,
          {
            credentials: "include",
          }
        );
        const user = await res.json();
        setUserId(user.id);

        const socketUrl = `${process.env.NEXT_PUBLIC_WS_BASE_URL}?userId=${user.id}`;
        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log("✅ WebSocket 연결됨");
        };

        socket.onmessage = (event) => {
          const message: ChatMessage = JSON.parse(event.data);
          console.log("📩 메시지 수신", message);
          setMessages((prev) => [...prev, message]);
        };

        socket.onclose = () => {
          console.log("❌ WebSocket 연결 종료됨");
        };

        socket.onerror = (err) => {
          console.error("🚨 WebSocket 에러:", err);
        };
      } catch (err) {
        console.error("🙅 사용자 정보 가져오기 실패", err);
      }
    };

    fetchUserInfo();

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/chat/send?roomId=${roomId}&content=${encodeURIComponent(newMessage)}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      setNewMessage("");
    } catch (err) {
      console.error("❌ 메시지 전송 실패", err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-xl mx-auto flex flex-col gap-4">
        <h2 className="text-2xl font-bold">채팅방: {roomId}</h2>

        <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-600 h-96 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="text-sm text-gray-800 dark:text-gray-100">
              <strong className="text-blue-600 dark:text-blue-400">
                {msg.nickname}:
              </strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault(); // 여기서 기본 submit 막기!
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded dark:bg-gray-900 dark:text-white"
            placeholder="메시지를 입력하세요..."
          />
          <button
            type="submit" // ✅ 명시적으로 submit button으로 지정
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            전송
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
