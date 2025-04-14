package com.example.demo.domain.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisChatPublisher {

    private final StringRedisTemplate redisTemplate;

    public void publish(String channel, String messageJson) {
        redisTemplate.convertAndSend(channel, messageJson);
        System.out.println("📡 Redis 발행: " + messageJson);
    }
}