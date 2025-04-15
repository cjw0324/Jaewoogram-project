package com.example.demo.domain.post.comment.repository;

import com.example.demo.domain.post.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepositiory extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.children WHERE c.post.postId = :postId")
    List<Comment> findAllWithChildrenByPostId(@Param("postId") Long postId);

}
