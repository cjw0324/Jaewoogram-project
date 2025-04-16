package com.example.demo.global.util;

import com.example.demo.domain.member.follow.repository.FollowRepository;
import com.example.demo.domain.member.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Util {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public boolean authorizeCheck(Long showUserId, Long requestUserId) {
        boolean isPrivate = userRepository.findById(showUserId).orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다.")).isPrivate();
        boolean show = followRepository.existsByFollowerIdAndFollowingIdAndApproved(requestUserId, showUserId, true);
        boolean forbidden = isPrivate && !show;
        boolean isMyPost = showUserId.equals(requestUserId);
        return !forbidden || isMyPost;
    }
}
