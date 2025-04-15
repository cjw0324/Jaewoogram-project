package com.example.demo.domain.member.follow.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FollowResponseDto {
    private String message;
    private boolean approved;

}
