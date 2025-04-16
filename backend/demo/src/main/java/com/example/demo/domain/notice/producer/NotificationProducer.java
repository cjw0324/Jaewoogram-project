package com.example.demo.domain.notice.producer;

import com.example.demo.domain.notice.message.NotificationMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendNotification(NotificationMessage message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            kafkaTemplate.send("notification", message.getReceiverId().toString(), json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Kafka 메시지 직렬화 실패", e);
        }
    }
}
