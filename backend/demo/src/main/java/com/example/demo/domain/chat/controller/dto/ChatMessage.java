package com.example.demo.domain.chat.controller.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    private String roomId;         // 채팅방 ID
    private Long senderId;         // 사용자 ID (User.id)
    private String nickname;       // 사용자 닉네임 (User.nickname)
    private String content;        // 메시지 내용
    private String messageType;    // TALK / ENTER / LEAVE
    private LocalDateTime timestamp;
}