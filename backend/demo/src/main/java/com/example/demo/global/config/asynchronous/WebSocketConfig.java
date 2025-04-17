package com.example.demo.global.config.asynchronous;

import com.example.demo.domain.chat.websocket.ChatWebSocketHandler;
import com.example.demo.domain.notice.websocket.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final NotificationWebSocketHandler notificationWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                .setAllowedOrigins("http://localhost:3000", "https://www.jaewoo.site");

        registry.addHandler(notificationWebSocketHandler, "/ws/notifications")
                .setAllowedOrigins("http://localhost:3000", "https://www.jaewoo.site");
    }
}
