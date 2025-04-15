package com.example.demo.domain.post.post.repository;

import com.example.demo.domain.post.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Integer countByAuthor_Id(Long authorId);

    List<Post> findByAuthor_Id(Long userId);

}
