package com.example.demo.domain.post.like.service;

import com.example.demo.domain.post.post.controller.dto.LikeResponse;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final RedissonClient redissonClient;
    private final PostLikeTransaction postLikeTransaction;


    public LikeResponse toggleLike(Long userId, Long postId) {
        String lockKey = "lock:post:like:" + postId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            if (lock.tryLock(3, 1, TimeUnit.SECONDS)) {
                return postLikeTransaction.toggle(userId, postId);
            } else {
                throw new RuntimeException("잠시 후 다시 시도해주세요.");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("락 획득 중 인터럽트 발생");
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
