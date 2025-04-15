package com.example.demo.domain.member.follow.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class FollowListResponseDto {
    private int totalCount;
    private List<UserDto> users;
}
