package com.example.demo.domain.user.controller;

import com.example.demo.domain.user.controller.dto.NicknameRequestDto;
import com.example.demo.domain.user.controller.dto.UserResponseDto;
import com.example.demo.domain.user.repository.UserRepository;
import com.example.demo.domain.user.service.UserService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @PostMapping("/nickname")
    public void registerNickname(JwtAuthentication auth, @RequestBody NicknameRequestDto requestDto) {
        userService.updateNickname(auth.getUserId(), requestDto);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(JwtAuthentication auth) {
        return ResponseEntity.ok(userService.getUserInfo(auth.getUserId()));
    }
}
