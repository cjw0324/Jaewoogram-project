package com.example.demo.domain.notice.consumer;

import com.example.demo.domain.notice.message.NotificationMessage;
import com.example.demo.domain.notice.publisher.RedisNotificationPublisher;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final ObjectMapper objectMapper;
    private final RedisNotificationPublisher redisPublisher;

    @KafkaListener(topics = "notification", groupId = "notification-group")
    public void consume(String jsonMessage, @Header(KafkaHeaders.RECEIVED_KEY) String userId) {
        try {
//            NotificationMessage message = objectMapper.readValue(jsonMessage, NotificationMessage.class);
            log.info("📩 Kafka 수신: {}, 대상 유저: {}", jsonMessage, userId);
            redisPublisher.publish("notification:" + userId, jsonMessage); // 그대로 Redis로
        } catch (RuntimeException e) {
            log.error("Kafka 메시지 해석 실패", e);
        }
    }
}

