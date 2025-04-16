package com.example.demo.global.config.asynchronous;

import com.example.demo.domain.chat.RedisChatSubscriber;
import com.example.demo.domain.notice.subscriber.RedisNotificationSubscriber;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
@RequiredArgsConstructor
public class RedisSubscriberConfig {

    private final RedisChatSubscriber redisChatSubscriber;
    private final RedisConnectionFactory redisConnectionFactory;
    private final RedisNotificationSubscriber redisNotificationSubscriber;

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer() {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory);
        container.addMessageListener(redisChatSubscriber, new PatternTopic("chat-channel"));
        container.addMessageListener(redisNotificationSubscriber, new PatternTopic("notification:*"));
        return container;
    }
}
