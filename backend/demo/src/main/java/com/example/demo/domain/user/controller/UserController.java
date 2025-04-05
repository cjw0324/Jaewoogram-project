package com.example.demo.domain.user.controller;

import com.example.demo.domain.user.controller.dto.NicknameRequestDto;
import com.example.demo.domain.user.repository.UserRepository;
import com.example.demo.domain.user.service.UserService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @PostMapping("/nickname")
    public void registerNickname(JwtAuthentication auth, @RequestBody NicknameRequestDto requestDto) {
        userService.updateNickname(auth.getUserId(), requestDto);
    }

}
