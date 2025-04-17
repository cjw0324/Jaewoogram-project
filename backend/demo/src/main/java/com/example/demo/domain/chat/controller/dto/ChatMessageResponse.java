package com.example.demo.domain.chat.controller.dto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {
    private Long messageId;
    private Long senderId;
    private String nickname;
    private String content;
    private String messageType;
    private LocalDateTime createdAt;
}