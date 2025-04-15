package com.example.demo.domain.member.user.controller;

import com.esotericsoftware.minlog.Log;
import com.example.demo.domain.member.user.controller.dto.UserDto;
import com.example.demo.domain.member.user.controller.dto.BioRequestDto;
import com.example.demo.domain.member.user.controller.dto.NicknameRequestDto;
import com.example.demo.domain.member.user.controller.dto.UserProfileDto;
import com.example.demo.domain.member.user.controller.dto.UserResponseDto;
import com.example.demo.domain.member.user.service.UserService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Random;

@Slf4j
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
        return ResponseEntity.ok(userService.searchByNickname_Elasticsearch(nickname));
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


//    @GetMapping("test/search/mysql")
//    public ResponseEntity<List<UserDto>> testSearchUsersMySQL() {
//        String keyword = getRandomTwoDigitKeyword();
//        return ResponseEntity.ok(userService.searchByNickname_MySQL(keyword));
//    }
//
//    @GetMapping("test/search/mongo")
//    public ResponseEntity<List<UserDto>> testSearchUsersMongo() {
//        String keyword = getRandomTwoDigitKeyword();
//        return ResponseEntity.ok(userService.searchByNickname_Mongo(keyword));
//    }
//
//    @GetMapping("test/search/elasticsearch")
//    public ResponseEntity<List<UserDto>> testSearchUsersElasticsearch() {
//        String keyword = getRandomTwoDigitKeyword();
//        return ResponseEntity.ok(userService.searchByNickname_Elasticsearch(keyword));
//    }
//
//    // 공통 키워드 생성 메서드
//    private String getRandomTwoDigitKeyword() {
//        int num = new Random().nextInt(100);  // 0 ~ 99
//        String keyword = String.format("%02d", num);    // 두 자리 문자열로 변환 ("01", "99" 등)
//        log.info("keyword : {} search", keyword);
//        return keyword;
//    }
}
