package com.example.demo.domain.post.like.service;

import com.example.demo.domain.post.comment.controller.dto.CommentLikeResponse;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CommentLikeService {

    private final CommentLikeTransaction transaction;
    private final RedissonClient redissonClient;

    public CommentLikeResponse toggleLike(Long userId, Long commentId) {
        String lockKey = "lock:comment:like:" + commentId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            if (lock.tryLock(3, 1, TimeUnit.SECONDS)) {
                return transaction.toggle(userId, commentId);
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
