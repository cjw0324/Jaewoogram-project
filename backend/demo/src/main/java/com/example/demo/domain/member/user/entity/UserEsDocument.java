package com.example.demo.domain.member.user.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEsDocument {
    private String id;
    private String nickname;

    public static UserEsDocument from(User user) {
        return UserEsDocument.builder()
                .id(String.valueOf(user.getId()))
                .nickname(user.getNickname())
                .build();
    }
}