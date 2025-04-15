package com.example.demo.domain.member.user.controller.dto;

import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.entity.UserDocument;
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

    public static UserDto from(UserDocument doc) {
        return new UserDto(Long.parseLong(doc.getId()), doc.getNickname());
    }
}
