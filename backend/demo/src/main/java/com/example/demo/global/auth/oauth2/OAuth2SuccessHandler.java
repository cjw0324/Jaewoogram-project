package com.example.demo.global.auth.oauth2;

import com.example.demo.domain.user.entity.User;
import com.example.demo.global.auth.jwt.JwtProvider;
import com.example.demo.global.auth.jwt.JwtToken;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@RequiredArgsConstructor
@Slf4j
@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    @Value("${oauth.redirect.uri}")
    private String URI;
    private final CustomOAuth2UserService oAuth2UserService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        User user = oAuth2UserService.getUser();
        boolean isNewUser = oAuth2UserService.isNewUser();

        // accessToken, refreshToken 발급
        JwtToken token = jwtProvider.issue(user);

        // 토큰 전달을 위한 redirect
        String redirectUrl = UriComponentsBuilder.fromUriString(URI)
                .queryParam("accessToken", token.getAccessToken())
                .queryParam("refreshToken", token.getRefreshToken())
                .queryParam("isNewUser", isNewUser)
                .queryParam("userRole", user.getUserRole())
                .build().toUriString();

        response.sendRedirect(redirectUrl);
    }
}
