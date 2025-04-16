package com.example.demo.domain.notice.subscriber;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisNotificationSubscriber implements MessageListener {

    private final NotificationWebSocketHandler webSocketHandler;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String payload = new String(message.getBody());
        String channel = new String(pattern);
        String userId = channel.replace("notification:", "");

        webSocketHandler.sendMessageToUser(userId, payload);
    }
}
