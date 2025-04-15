package com.example.demo.domain.member.follow.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FollowStatusResponseDto {
    private Long targetUserId;
    private FollowState status;

}