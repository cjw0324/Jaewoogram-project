package com.example.demo.domain.chat.consumer;

import com.example.demo.domain.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatKafkaConsumer {

    private final ChatMessageService chatMessageService;

    @KafkaListener(topics = "chat-messages", groupId = "chat-group")
    public void consume(String messageJson) {
        System.out.println("📥 Kafka 메시지 수신: " + messageJson);
        chatMessageService.handleIncomingMessage(messageJson);
    }
}
