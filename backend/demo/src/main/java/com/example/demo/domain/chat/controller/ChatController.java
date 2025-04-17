package com.example.demo.domain.chat.controller;

import com.example.demo.domain.chat.controller.dto.SendChatMessageRequest;
import com.example.demo.domain.chat.producer.ChatKafkaProducer;
import com.example.demo.domain.chat.service.ChatMessageService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatKafkaProducer producer;
    private final ChatMessageService chatMessageService;

    @PostMapping("/send")
    public ResponseEntity<?> sendChatMessage(
            @RequestBody SendChatMessageRequest request,
            JwtAuthentication auth
    ) {
        chatMessageService.chatToMessage(request, auth);
        return ResponseEntity.ok().build();
    }

}
