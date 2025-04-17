package com.example.demo.domain.chat.producer;

import com.example.demo.domain.chat.controller.dto.ChatMessage;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatKafkaProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendChatMessage(String roomId, String content, JwtAuthentication authentication) {
        ChatMessage message = ChatMessage.builder()
                .roomId(roomId)
                .senderId(authentication.getUserId())
                .nickname(authentication.getNickname())
                .content(content)
                .messageType("TALK")
                .createdAt(LocalDateTime.now())
                .build();

        try {
            String json = objectMapper.writeValueAsString(message);
            kafkaTemplate.send("chat-messages", json);
            System.out.println("📤 Kafka 메시지 전송: " + json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("메시지 직렬화 실패", e);
        }
    }
}

