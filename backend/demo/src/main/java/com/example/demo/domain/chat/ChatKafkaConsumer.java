package com.example.demo.domain.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatKafkaConsumer {

    private final RedisChatPublisher redisChatPublisher;

    @KafkaListener(topics = "chat-messages", groupId = "chat-group")
    public void consume(String messageJson) {
        System.out.println("📥 Kafka 메시지 수신: " + messageJson);

        // Redis로 publish
        redisChatPublisher.publish("chat-channel", messageJson);
    }
}