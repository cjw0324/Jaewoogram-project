package com.example.demo.domain.member.user.controller.dto;

import com.example.demo.domain.member.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String nickname;
    private boolean isPrivate;
    private int followerCount;
    private int followingCount;
    private String bio;

    public UserProfileDto(User user, int followerCount, int followingCount) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.isPrivate = user.isPrivate();
        this.followerCount = followerCount;
        this.followingCount = followingCount;
        this.bio = user.getBio();
    }
}
