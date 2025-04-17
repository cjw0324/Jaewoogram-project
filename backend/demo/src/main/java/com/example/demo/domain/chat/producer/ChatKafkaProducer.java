package com.example.demo.domain.chat.producer;

import com.example.demo.domain.chat.controller.dto.ChatMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatKafkaProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendChatMessage(ChatMessage message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            kafkaTemplate.send("chat-messages", json);
            System.out.println("📤 Kafka 메시지 전송: " + json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("메시지 직렬화 실패", e);
        }
    }
}

