package com.example.demo.domain.notice.subscriber;
import com.example.demo.domain.notice.websocket.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisNotificationSubscriber implements MessageListener {

    private final NotificationWebSocketHandler webSocketHandler;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String payload = new String(message.getBody());
        String channel = new String(message.getChannel()); // "notification:1"
        String userId = channel.replace("notification:", "");


        log.info("📡 Redis 수신: {}", new String(message.getBody()));
        webSocketHandler.sendMessageToUser(userId, payload);
    }
}
