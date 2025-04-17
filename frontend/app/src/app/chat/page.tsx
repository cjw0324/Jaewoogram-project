// app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatRoomSummaryResponse } from "../types/chat";

export default function ChatRoomListPage() {
  const [rooms, setRooms] = useState<ChatRoomSummaryResponse[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/rooms`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("채팅방 목록 불러오기 실패");
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRooms();
  }, []);

  const handleEnterRoom = (roomId: number) => {
    router.push(`/chat/${roomId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📋 내 채팅방 목록</h1>
      {rooms.length === 0 ? (
        <p>채팅방이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room.roomId}
              className="border p-4 rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => handleEnterRoom(room.roomId)}
            >
              <p className="font-semibold">
                {room.type === "DIRECT"
                  ? "1:1 채팅방"
                  : `그룹 채팅: ${room.roomName}`}
              </p>
              <p className="text-sm text-gray-500">방 ID: {room.roomId}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
