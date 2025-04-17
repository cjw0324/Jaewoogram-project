package com.example.demo.domain.chat.controller;

import com.example.demo.domain.chat.controller.dto.SendChatMessageRequest;
import com.example.demo.domain.chat.producer.ChatKafkaProducer;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatKafkaProducer producer;

    @PostMapping("/send")
    public ResponseEntity<?> sendChatMessage(
            @RequestBody SendChatMessageRequest request,
            JwtAuthentication auth
    ) {
        producer.sendChatMessage(String.valueOf(request.getRoomId()), request.getContent(), auth);
        return ResponseEntity.ok().build();
    }

}
