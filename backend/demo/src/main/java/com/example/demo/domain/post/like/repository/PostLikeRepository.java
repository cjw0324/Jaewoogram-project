package com.example.demo.domain.post.like.repository;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.post.like.entity.PostLike;
import com.example.demo.domain.post.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostAndUser(Post post, User user);

    boolean existsByPostPostIdAndUserId(Long postId, Long userId);
}
