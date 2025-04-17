package com.example.demo.domain.chat.controller.dto;
import lombok.Getter;

@Getter
public class SendChatMessageRequest {
    private Long roomId;
    private String content;
}