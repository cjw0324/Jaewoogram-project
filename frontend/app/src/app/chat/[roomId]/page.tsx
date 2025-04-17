"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ChatMessage } from "@/app/types/chat";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ChatRoomDetailPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 자주 사용하는 이모지 목록
  const commonEmojis = [
    "😊",
    "😂",
    "❤️",
    "👍",
    "🙏",
    "😍",
    "🥰",
    "😘",
    "🤔",
    "🤣",
    "😭",
    "😅",
    "👏",
    "🔥",
    "✨",
    "💕",
    "😎",
    "👀",
    "💯",
    "💪",
    "🙄",
    "😉",
    "😁",
    "😌",
    "🥺",
    "😳",
    "🤗",
    "🤩",
    "🤪",
    "👌",
    "✅",
    "🎉",
  ];

  // 초기 메시지 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/messages/${roomId}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();
  }, [roomId]);

  // WebSocket 연결
  useEffect(() => {
    if (!user) return;
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_BASE_URL}/chat?userId=${user.id}`
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const newMessage: ChatMessage = JSON.parse(event.data);
      if (newMessage.roomId === String(roomId)) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    ws.onopen = () => console.log("🔌 WebSocket 연결됨");
    ws.onclose = () => console.log("❌ WebSocket 연결 종료");

    return () => ws.close();
  }, [user, roomId]);

  // 메시지 전송
  const sendMessage = async () => {
    if (!content.trim()) return;

    // 현재 선택된 텍스트가 있는지 확인
    const hasSelection =
      inputRef.current &&
      inputRef.current.selectionStart !== inputRef.current.selectionEnd;

    // 입력 과정 중이거나 선택된 텍스트가 있으면 전송하지 않음
    if (isComposing || hasSelection) return;

    // 입력창 미리 비우기 (중복 전송 방지)
    const messageToSend = content;
    setContent("");

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/send`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          content: messageToSend,
        }),
      });
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      // 전송 실패 시 메시지 복원
      setContent(messageToSend);
    }

    // 입력창에 포커스 주기
    inputRef.current?.focus();
  };

  const handleHideRoom = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/rooms/${roomId}/hide`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("삭제 실패");

      // 모달 닫기
      setShowDeleteModal(false);

      // 이전 페이지로 이동
      window.history.back();
    } catch (error) {
      console.error("채팅방 삭제 실패:", error);
      alert("문제가 발생했습니다.");
      setShowDeleteModal(false);
    }
  };

  // 스크롤 하단 고정
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅방 이름 설정 (현재 사용자가 아닌 상대방의 닉네임으로)
  const getChatRoomName = () => {
    // 메시지가 없는 경우
    if (!messages.length) return `채팅방 #${roomId}`;

    // 메시지가 있는 경우 상대방 닉네임 찾기
    const otherUserMessages = messages.filter(
      (msg) => msg.nickname !== user?.nickname
    );

    // 상대방의 메시지가 있으면 상대방 닉네임 반환
    if (otherUserMessages.length > 0) {
      return otherUserMessages[0].nickname;
    }

    // 상대방 메시지가 없고 현재 사용자 메시지만 있는 경우
    return messages[0].nickname !== user?.nickname
      ? messages[0].nickname
      : `채팅방 #${roomId}`;
  };

  return (
    <div className="flex flex-col h-[65vh] bg-white max-w-lg mx-auto shadow-lg rounded-md">
      {/* 헤더 (인스타그램 스타일) */}
      <div className="border-b border-gray-200 py-3 px-4 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
        <div className="flex items-center">
          <button
            onClick={() => window.history.back()}
            className="mr-3 text-gray-800"
          >
            ←
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
              {getChatRoomName().charAt(0)}
            </div>
            <div className="ml-3">
              <h1 className="font-semibold text-gray-900 text-sm">
                {getChatRoomName()}
              </h1>
              <p className="text-xs text-gray-500">활동 중</p>
            </div>
          </div>
        </div>

        <button
          className="text-gray-600 p-1"
          onClick={() => setShowDeleteModal(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto py-3 px-4 bg-white">
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.nickname === user?.nickname;

          return (
            <div
              key={idx}
              className={`mb-3 flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isCurrentUser && (
                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 mr-2 text-sm">
                  {msg.nickname.charAt(0)}
                </div>
              )}

              <div className="max-w-[75%]">
                {!isCurrentUser && (
                  <div className="text-xs text-gray-600 mb-1 ml-1">
                    {msg.nickname}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 break-words text-sm ${
                    isCurrentUser
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    isCurrentUser ? "text-right" : "text-left"
                  } pr-1`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-3 border-t border-gray-200 bg-white shrink-0">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            className="bg-transparent border-none outline-none flex-1 py-1 px-2 text-gray-800 placeholder-gray-500 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                e.preventDefault();
                if (content.trim()) {
                  sendMessage();
                }
              }
            }}
            placeholder="메시지 보내기..."
          />

          {content.trim() ? (
            <button
              onClick={sendMessage}
              className="ml-2 text-blue-500 font-semibold text-sm"
            >
              전송
            </button>
          ) : (
            <button
              className="ml-2 text-gray-600"
              onClick={() => setShowEmojiModal(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-72 overflow-hidden">
            <div className="p-5 text-center">
              <h3 className="text-base font-semibold mb-3">
                채팅을 영구적으로 삭제하시겠어요?
              </h3>
              <p className="text-gray-500 text-xs mb-4">
                이 작업은 되돌릴 수 없습니다.
              </p>

              <div className="border-t border-gray-200">
                <button
                  onClick={handleHideRoom}
                  className="w-full py-3 text-red-500 font-semibold border-b border-gray-200 text-sm"
                >
                  삭제
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-3 text-gray-800 text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이모지 선택 모달 */}
      {showEmojiModal && (
        <div className="absolute bottom-16 left-0 right-0 z-50 mx-auto w-full max-w-lg bg-white rounded-xl shadow-lg">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">이모지 선택</h3>
              <button
                onClick={() => setShowEmojiModal(false)}
                className="text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {commonEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  className="text-2xl p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => {
                    setContent((prevContent) => prevContent + emoji);
                    setShowEmojiModal(false);
                    inputRef.current?.focus();
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
