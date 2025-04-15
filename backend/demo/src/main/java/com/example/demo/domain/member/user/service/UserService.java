package com.example.demo.domain.member.user.service;

import com.example.demo.domain.member.user.controller.dto.UserDto;
import com.example.demo.domain.member.follow.repository.FollowRepository;
import com.example.demo.domain.member.user.controller.dto.NicknameRequestDto;
import com.example.demo.domain.member.user.controller.dto.UserProfileDto;
import com.example.demo.domain.member.user.controller.dto.UserResponseDto;
import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.repository.UserMongoRepository;
import com.example.demo.domain.member.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMongoRepository userMongoRepository;
    private final FollowRepository followRepository;

    @Transactional
    public void updateNickname(Long userId, NicknameRequestDto requestDto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("user not found"));
        user.setNickname(requestDto.getNickname());
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserResponseDto.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> searchByNickname_MySQL(String keyword) {
        return userRepository.findByNicknameContainingIgnoreCase(keyword).stream()
                .map(UserDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDto> searchByNickname_Mongo(String keyword) {
        String lower = keyword.toLowerCase();
        return userMongoRepository.findByNicknameContaining(lower)
                .stream()
                .map(UserDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        int followerCount = (int) followRepository.countByFollowingIdAndApprovedTrue(userId);
        int followingCount = (int) followRepository.countByFollowerIdAndApprovedTrue(userId);

        return new UserProfileDto(user, followerCount, followingCount);
    }

    @Transactional
    public Boolean setPublicStatus(Long requestUserId, Long changeUserId) {
        if (requestUserId.equals(changeUserId)) {
            return userRepository.findById(changeUserId).orElseThrow(() -> new RuntimeException("유저가 존재하지 않습니다.")).setPrivate();
        } else {
            throw new RuntimeException("요청 유저와 변경 유저가 다릅니다.");
        }
    }

    @Transactional
    public void setBio(Long userId, String bio) {
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("유저가 존재하지 않습니다.")).setBio(bio);
    }
}
