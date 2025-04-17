// app/types/chat.ts
export type ChatRoomType = "DIRECT" | "GROUP";

export interface ChatRoomSummaryResponse {
  roomId: number;
  roomName: string | null;
  type: ChatRoomType;
}

export interface ChatMessage {
  roomId: string;
  senderId: number;
  nickname: string;
  content: string;
  messageType: string;
  createdAt: string;
}
