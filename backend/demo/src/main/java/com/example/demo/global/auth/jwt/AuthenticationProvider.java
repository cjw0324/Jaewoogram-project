package com.example.demo.global.auth.jwt;


import com.example.demo.domain.member.user.entity.UserRole;

public interface AuthenticationProvider {
    String createAccessToken(String userId, UserRole userRole);
    String createRefreshToken(String userId, UserRole userRole);

}
