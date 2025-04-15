package com.example.demo.domain.post.like.repository;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.post.comment.entity.Comment;
import com.example.demo.domain.post.like.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByCommentAndUser(Comment comment, User user);
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
}
