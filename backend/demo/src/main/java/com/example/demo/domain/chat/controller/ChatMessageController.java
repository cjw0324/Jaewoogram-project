package com.example.demo.domain.chat.controller;

import com.example.demo.domain.chat.auth.ChatAuthorizationValidator;
import com.example.demo.domain.chat.controller.dto.ChatMessageResponse;
import com.example.demo.domain.chat.service.ChatMessageService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/chat/messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final ChatAuthorizationValidator authorizationValidator;
    @GetMapping("/{roomId}")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long roomId,
            JwtAuthentication auth
    ) {
        authorizationValidator.validateParticipant(roomId, auth.getUserId());
        List<ChatMessageResponse> messages = chatMessageService.getMessagesVisibleToUser(roomId, auth.getUserId());
        return ResponseEntity.ok(messages);
    }
}
