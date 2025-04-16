package com.example.demo.domain.post.like.service;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.repository.UserRepository;
import com.example.demo.domain.notice.message.NotificationMessage;
import com.example.demo.domain.notice.message.NotificationType;
import com.example.demo.domain.notice.producer.NotificationProducer;
import com.example.demo.domain.post.comment.entity.Comment;
import com.example.demo.domain.post.comment.repository.CommentRepositiory;
import com.example.demo.domain.post.like.entity.CommentLike;
import com.example.demo.domain.post.like.repository.CommentLikeRepository;
import com.example.demo.domain.post.comment.controller.dto.CommentLikeResponse;
import com.example.demo.domain.post.post.entity.Post;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CommentLikeTransaction {

    private final CommentRepositiory commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final UserRepository userRepository;
    private final RedissonClient redissonClient;
    private final NotificationProducer notificationProducer;

    @Transactional
    public CommentLikeResponse toggle(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        String redisKey = "comment:like:" + commentId;
        RAtomicLong atomicLong = redissonClient.getAtomicLong(redisKey);

        Optional<CommentLike> existing = commentLikeRepository.findByCommentAndUser(comment, user);
        long count;
        String message;

        if (existing.isPresent()) {
            commentLikeRepository.delete(existing.get());
            count = atomicLong.decrementAndGet();
            message = "좋아요 취소";
        } else {
            commentLikeRepository.save(new CommentLike(null, comment, user));
            count = atomicLong.incrementAndGet();
            message = "좋아요 추가";
            sendNotification(comment, user);
        }

        return new CommentLikeResponse(commentId, (int) count, message);
    }

    public void sendNotification(Comment comment, User user) {

        Map<String, Object> data = new HashMap<>();
        data.put("commentId", comment.getId());
        data.put("postId", comment.getPost().getPostId());
        data.put("comment", comment.getComment());

        notificationProducer.sendNotification(
                new NotificationMessage(
                        NotificationType.COMMENT_LIKE,          //what
                        comment.getAuthor().getId(),            //receiver
                        user.getId(),                           //sender
                        user.getNickname(),                     //sender nickname
                        data
                )
        );
    }
}
