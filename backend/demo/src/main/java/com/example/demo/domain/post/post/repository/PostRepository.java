package com.example.demo.domain.post.post.repository;

import com.example.demo.domain.post.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    Integer countByAuthor_Id(Long authorId);
}
