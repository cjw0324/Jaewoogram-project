package com.example.demo.domain.post.feed.service;

import com.example.demo.domain.post.feed.controller.dto.UserFeedResponse;
import com.example.demo.domain.post.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserFeedService {
    private final PostRepository postRepository;


    public List<UserFeedResponse> userFeedList(Long userId) {
        return postRepository.findByAuthor_Id(userId).stream()
                .map(post -> new UserFeedResponse(post.getPostId(), post.getFirstImageUrl()))
                .toList();
    }

}
