package com.example.demo.domain.chat.controller.dto;

import com.example.demo.domain.chat.entity.ChatRoomType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatRoomSummaryResponse {
    private Long roomId;
    private String roomName;
    private ChatRoomType type;
}