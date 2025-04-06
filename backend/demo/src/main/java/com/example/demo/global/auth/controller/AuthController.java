package com.example.demo.global.auth.controller;

import com.example.demo.domain.user.entity.User;
import com.example.demo.domain.user.repository.UserRepository;
import com.example.demo.global.auth.jwt.JwtProvider;
import com.example.demo.global.auth.jwt.JwtToken;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @PostMapping("/reissue")
    public ResponseEntity<?> reissueToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 1. 쿠키에서 refreshToken 추출
            String refreshToken = jwtProvider.getRefreshTokenFromRequest(request);

            // 2. 토큰 검증 및 userId 추출
            String userId = jwtProvider.getUserIdFromToken(refreshToken);
            User user = userRepository.findById(Long.parseLong(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 3. 새 토큰 발급
            JwtToken newToken = jwtProvider.issue(user);

            // 4. 새 토큰 쿠키로 설정
            Cookie newAccess = new Cookie("access-token", newToken.getAccessToken());
            newAccess.setHttpOnly(true);
            newAccess.setSecure(true);
            newAccess.setPath("/");
            newAccess.setMaxAge(60 * 60);

            Cookie newRefresh = new Cookie("refresh-token", newToken.getRefreshToken());
            newRefresh.setHttpOnly(true);
            newRefresh.setSecure(true);
            newRefresh.setPath("/");
            newRefresh.setMaxAge(60 * 60 * 24 * 7);

            response.addCookie(newAccess);
            response.addCookie(newRefresh);

            return ResponseEntity.ok().body("Token reissued");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Reissue failed: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 현재 인증된 사용자의 SecurityContext 클리어
            SecurityContextHolder.clearContext();

            // 세션 무효화
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            // 쿠키 제거
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    cookie.setMaxAge(0);
                    cookie.setPath("/");
                    response.addCookie(cookie);
                }
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

