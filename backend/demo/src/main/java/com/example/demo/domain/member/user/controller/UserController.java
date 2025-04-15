package com.example.demo.domain.member.user.controller;

import com.example.demo.domain.member.follow.controller.dto.UserDto;
import com.example.demo.domain.member.user.controller.dto.BioRequestDto;
import com.example.demo.domain.member.user.controller.dto.NicknameRequestDto;
import com.example.demo.domain.member.user.controller.dto.UserProfileDto;
import com.example.demo.domain.member.user.controller.dto.UserResponseDto;
import com.example.demo.domain.member.user.service.UserService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam String nickname
    ) {
        return ResponseEntity.ok(userService.searchByNickname(nickname));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PostMapping("/change/status")
    public ResponseEntity<Boolean> changePublicStatus(JwtAuthentication auth, @RequestHeader Long userId) {
        return ResponseEntity.ok(userService.setPublicStatus(auth.getUserId(), userId));
    }

    @PostMapping("/change/bio")
    public ResponseEntity<Void> changeBio(JwtAuthentication auth, @RequestBody BioRequestDto request) {
        userService.setBio(auth.getUserId(), request.getBio());
        return ResponseEntity.ok(null);
    }
}
