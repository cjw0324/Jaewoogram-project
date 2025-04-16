package com.example.demo.domain.notice.consumer;

import com.example.demo.domain.notice.message.LikeNotificationMessage;
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

    @KafkaListener(topics = "notification-like", groupId = "notification-group")
    public void consume(String jsonMessage, @Header(KafkaHeaders.RECEIVED_KEY) String userId) {
        try {
            LikeNotificationMessage message = objectMapper.readValue(jsonMessage, LikeNotificationMessage.class);
            redisPublisher.publish("notification:" + userId, jsonMessage); // 그대로 Redis로
        } catch (JsonProcessingException e) {
            log.error("Kafka 메시지 역직렬화 실패", e);
        }
    }
}

