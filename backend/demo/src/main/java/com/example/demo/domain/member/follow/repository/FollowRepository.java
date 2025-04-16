package com.example.demo.domain.member.follow.repository;

import com.example.demo.domain.member.follow.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    List<Follow> findByFollowingIdAndApprovedFalse(Long userId);
    List<Follow> findByFollowerIdAndApprovedFalse(Long userId);
    List<Follow> findByFollowerIdAndApprovedTrue(Long userId);
    List<Follow> findByFollowingIdAndApprovedTrue(Long userId);

    long countByFollowingIdAndApprovedTrue(Long followingId); // 승인된 팔로워 수
    long countByFollowerIdAndApprovedTrue(Long followerId);   // 승인된 팔로잉 수

    boolean existsByFollowerIdAndFollowingIdAndApproved(Long followerId, Long followingId, boolean approved);
}
