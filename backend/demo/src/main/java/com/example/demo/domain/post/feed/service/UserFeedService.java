package com.example.demo.domain.post.feed.service;

import com.example.demo.domain.member.follow.repository.FollowRepository;
import com.example.demo.domain.member.user.repository.UserRepository;
import com.example.demo.domain.post.feed.controller.dto.UserFeedResponse;
import com.example.demo.domain.post.post.repository.PostRepository;
import com.example.demo.global.exception.AccessDeniedException;
import com.example.demo.global.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserFeedService {
    private final PostRepository postRepository;
    private final Util util;

    public List<UserFeedResponse> userFeedList(Long showUserId, Long requestUserId) {
        if (!util.authorizeCheck(showUserId, requestUserId)) {
            throw new AccessDeniedException("게시글 조회 권한이 없습니다");
        }
        return postRepository.findByAuthor_Id(showUserId).stream()
                .map(post -> new UserFeedResponse(post.getPostId(), post.getFirstImageUrl()))
                .toList();
    }


    public Integer userFeedCount(Long showUserId) {
        return postRepository.countByAuthor_Id(showUserId);
    }
}
