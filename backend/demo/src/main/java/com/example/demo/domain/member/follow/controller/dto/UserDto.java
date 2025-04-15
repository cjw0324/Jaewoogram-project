package com.example.demo.domain.member.follow.controller.dto;

import com.example.demo.domain.member.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserDto {

    private Long id;
    private String nickname;

    public UserDto(Long id, String nickname) {
        this.id = id;
        this.nickname = nickname;
    }

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getNickname());
    }
}
