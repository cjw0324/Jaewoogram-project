package com.example.demo.domain.member.follow.service;

import com.example.demo.domain.member.follow.controller.dto.*;
import com.example.demo.domain.member.follow.entity.Follow;
import com.example.demo.domain.member.follow.repository.FollowRepository;
import com.example.demo.domain.member.user.controller.dto.UserDto;
import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    @Transactional
    public FollowResponseDto follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("cannot self following");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return new FollowResponseDto("이미 요청되었습니다.", false);
        }

        User follower = userRepository.getReferenceById(followerId);
        User following = userRepository.getReferenceById(followingId);

        boolean isApproved = !following.isPrivate();

        Follow follow = new Follow(follower, following);
        follow.setApproved(isApproved);

        followRepository.save(follow);
        String msg = isApproved ? "팔로우가 완료되었습니다." : "팔로우 요청을 보냈습니다.";
        return new FollowResponseDto(msg, isApproved);
    }

    @Transactional
    public SimpleResponseDto approveFollow(Long followId, Long followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followId, followingId)
                .orElseThrow(() -> new IllegalArgumentException("요청이 존재하지 않습니다."));

        if (!follow.getFollowing().getId().equals(followingId)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }

        follow.setApproved(true);

        return new SimpleResponseDto("팔로우 요청을 승인했습니다.");
    }

    @Transactional
    public SimpleResponseDto cancelFollowRequest(Long followerId, Long followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new IllegalArgumentException("팔로우 요청이 존재하지 않습니다."));

        if (follow.isApproved()) {
            throw new IllegalStateException("이미 승인된 팔로우는 취소할 수 없습니다.");
        }

        followRepository.delete(follow);
        return new SimpleResponseDto("팔로우 요청을 취소했습니다.");
    }

    @Transactional
    public SimpleResponseDto unfollow(Long followerId, Long followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new IllegalArgumentException("팔로우 관계가 존재하지 않습니다."));

        followRepository.delete(follow);
        return new SimpleResponseDto("언팔로우 처리되었습니다.");
    }

    @Transactional(readOnly = true)
    public List<UserDto> getPendingFollowRequests(Long currentUserId) {
        // 나를 팔로우 요청했지만 아직 승인되지 않은 Follow 목록 조회
        List<Follow> requests = followRepository.findByFollowingIdAndApprovedFalse(currentUserId);

        return requests.stream()
                .map(Follow::getFollower)  // 나를 팔로우한 사람
                .map(UserDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDto> getMyPendingFollowings(Long currentUserId) {
        // 내가 요청했지만 아직 승인되지 않은 Follow 목록 조회
        List<Follow> requests = followRepository.findByFollowerIdAndApprovedFalse(currentUserId);

        return requests.stream()
                .map(Follow::getFollowing)  // 내가 팔로우 신청한 상대방
                .map(UserDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public FollowListResponseDto getMyFollowers(Long userId) {
        List<Follow> follows = followRepository.findByFollowingIdAndApprovedTrue(userId);
        List<UserDto> users = follows.stream()
                .map(Follow::getFollower)
                .map(UserDto::from)
                .toList();

        return new FollowListResponseDto(users.size(), users);
    }

    @Transactional(readOnly = true)
    public FollowListResponseDto getMyFollowings(Long userId) {
        List<Follow> follows = followRepository.findByFollowerIdAndApprovedTrue(userId);
        List<UserDto> users = follows.stream()
                .map(Follow::getFollowing)
                .map(UserDto::from)
                .toList();

        return new FollowListResponseDto(users.size(), users);
    }


    @Transactional(readOnly = true)
    public FollowStatusResponseDto getFollowStatus(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            return new FollowStatusResponseDto(targetUserId, FollowState.NONE); // 자기 자신
        }
        return followRepository.findByFollowerIdAndFollowingId(currentUserId, targetUserId)
                .map(follow -> {
                    if (follow.isApproved()) return new FollowStatusResponseDto(targetUserId, FollowState.FOLLOWING);
                    else return new FollowStatusResponseDto(targetUserId, FollowState.REQUESTED);
                })
                .orElseGet(() -> new FollowStatusResponseDto(targetUserId, FollowState.NONE));
    }

}
