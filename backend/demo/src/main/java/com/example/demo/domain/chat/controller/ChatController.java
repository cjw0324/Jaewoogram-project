package com.example.demo.domain.chat.controller;

import com.example.demo.domain.chat.ChatKafkaProducer;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatKafkaProducer producer;


    @PostMapping("/send")
    public ResponseEntity<?> sendChatMessage(
            @RequestParam String roomId,
            @RequestParam String content,
            JwtAuthentication auth
    ) {
        producer.sendChatMessage(roomId, content, auth);
        return ResponseEntity.ok().build();
    }
}
