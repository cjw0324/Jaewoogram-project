package com.example.demo.domain.post.like.service;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.repository.UserRepository;
import com.example.demo.domain.notice.message.NotificationMessage;
import com.example.demo.domain.notice.message.NotificationType;
import com.example.demo.domain.notice.producer.NotificationProducer;
import com.example.demo.domain.post.like.entity.PostLike;
import com.example.demo.domain.post.like.repository.PostLikeRepository;
import com.example.demo.domain.post.post.controller.dto.LikeResponse;
import com.example.demo.domain.post.post.entity.Post;
import com.example.demo.domain.post.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostLikeTransaction {
    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RedissonClient redissonClient;
    private final NotificationProducer notificationProducer;

    @Transactional
    public LikeResponse toggle(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Optional<PostLike> existing = postLikeRepository.findByPostAndUser(post, user);
        String redisKey = "post:like:" + postId;
        RAtomicLong atomicLong = redissonClient.getAtomicLong(redisKey);

        long count;
        String message;

        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            count = atomicLong.decrementAndGet();
            message = "좋아요 취소";
        } else {
            postLikeRepository.save(new PostLike(null, post, user));
            count = atomicLong.incrementAndGet();
            message = "좋아요 추가";

            log.info("👍 좋아요 알림 전송 대상: {}, 게시글: {}", post.getAuthor().getId(), post.getAuthor().getId());
            sendNotification(post, user);
        }

        return new LikeResponse(postId, (int) count, message);
    }

    public void sendNotification(Post post, User user) {

        Map<String, Object> data = new HashMap<>();
        data.put("postId", post.getPostId());
        data.put("title", post.getTitle());

        notificationProducer.sendNotification(
                new NotificationMessage(
                        NotificationType.POST_LIKE,
                        post.getAuthor().getId(),
                        user.getId(),
                        user.getNickname(),
                        data
                )
        );
    }
}
