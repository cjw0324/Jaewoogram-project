package com.example.demo.domain.member.follow.service;

import com.example.demo.domain.member.follow.controller.dto.*;
import com.example.demo.domain.member.follow.entity.Follow;
import com.example.demo.domain.member.follow.repository.FollowRepository;
import com.example.demo.domain.member.user.controller.dto.UserDto;
import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.repository.UserRepository;
import com.example.demo.domain.notice.message.NotificationMessage;
import com.example.demo.domain.notice.message.NotificationType;
import com.example.demo.domain.notice.producer.NotificationProducer;
import com.example.demo.global.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final Util util;
    private final NotificationProducer notificationProducer;

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

        if (isApproved) {
            // 바로 팔로우 된 거임. 팔로우 한 사람 -> 팔로잉 된 사람 알람 보내기
            sendNotification(NotificationType.FOLLOW, follow.getFollower(), follow.getFollowing());
        } else {
            // 바로 팔로우 안됨. 팔로우 한 사람 -> 팔로잉 된 사람에게 승인 요청 보내기
            sendNotification(NotificationType.FOLLOW_REQUEST, follow.getFollower(), follow.getFollowing());
        }

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
        // 팔로우 승인 됨. 팔로우 승인 한 사람 -> 팔로우 요청 보낸 사람
        sendNotification(NotificationType.FOLLOW_ACCEPTED, follow.getFollowing(), follow.getFollower());
        return new SimpleResponseDto("팔로우 요청을 승인했습니다.");
    }

    public void sendNotification(NotificationType type, User requestUser, User requiredUser) {
        Map<String, Object> data = new HashMap<>();

        data.put("time", LocalDateTime.now());

        notificationProducer.sendNotification(
                new NotificationMessage(
                        type,
                        requiredUser.getId(),
                        requestUser.getId(),
                        requestUser.getNickname(),
                        data
                )
        );
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
    public FollowListResponseDto getMyFollowers(Long showUserId, Long requestUserId) {


        if (!util.authorizeCheck(showUserId, requestUserId)) {
            throw new com.example.demo.global.exception.AccessDeniedException("팔로잉 목록 권한이 없습니다");
        }

        List<Follow> follows = followRepository.findByFollowingIdAndApprovedTrue(showUserId);
        List<UserDto> users = follows.stream()
                .map(Follow::getFollower)
                .map(UserDto::from)
                .toList();

        return new FollowListResponseDto(users.size(), users);
    }

    @Transactional(readOnly = true)
    public FollowListResponseDto getMyFollowings(Long showUserId, Long requestUserId) {


        if (!util.authorizeCheck(showUserId, requestUserId)) {
            throw new com.example.demo.global.exception.AccessDeniedException("팔로잉 목록 권한이 없습니다");
        }

        List<Follow> follows = followRepository.findByFollowerIdAndApprovedTrue(showUserId);
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
