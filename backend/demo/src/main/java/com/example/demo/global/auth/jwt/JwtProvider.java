package com.example.demo.global.auth.jwt;

import com.example.demo.domain.user.entity.User;
import com.example.demo.domain.user.entity.UserRole;
import com.example.demo.domain.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtProvider implements AuthenticationProvider {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.access.expiration}")
    private long accessTokenValidityInSeconds;
    @Value("${jwt.refresh.expiration}")
    private long refreshTokenValidityInSeconds;
    @Value("${jwt.access.header}")
    private String accessHeader;
    @Value("${jwt.refresh.header}")
    private String refreshHeader;

    private static final String ACCESS_TOKEN_SUBJECT = "AccessToken";
    private static final String REFRESH_TOKEN_SUBJECT = "RefreshToken";
    private static final String USERNAME_CLAIM = "email";
    private static final String BEARER = "bearer ";
    public static final String AUTHORIZATION = "Authorization";

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final ObjectMapper objectMapper;

    public JwtToken issue(User user){
        return JwtToken.builder()
                .accessToken(createAccessToken(user.getId().toString(), user.getUserRole()))
                .refreshToken(createRefreshToken(user.getId().toString(), user.getUserRole()))
                .build();
    }

    public JwtAuthentication getAuthentication(String accessToken) {
        Jws<Claims> claimsJws = validateAccessToken(accessToken);

        Claims body = claimsJws.getBody();
        Long userId = Long.parseLong((String) body.get("userId"));
        UserRole userRole = UserRole.of((String) body.get("userRole"));

        return new JwtAuthentication(userId, userRole);
    }

    @Override
    public String createAccessToken(String userId, UserRole userRole) {
        Claims claims = Jwts.claims();
        claims.put("userId", userId);
        claims.put("userRole", userRole);

        return Jwts.builder()
                .setSubject(ACCESS_TOKEN_SUBJECT)
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValidityInSeconds * 1000))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    @Override
    public String createRefreshToken(String userId, UserRole userRole) {
        String jti = UUID.randomUUID().toString();

        Claims claims = Jwts.claims();
        claims.put("userId", userId);
        claims.put("userRole", userRole);

        tokenService.storeRefreshTokenJti(userId, jti);

        return Jwts
                .builder()
                .setSubject(REFRESH_TOKEN_SUBJECT)
                .setClaims(claims)
                .setId(jti)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValidityInSeconds * 1000))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public String refreshRefreshToken(String userId, UserRole userRole) {
        String jti = UUID.randomUUID().toString();
        Claims claims = Jwts.claims();
        claims.put("userId", userId);
        claims.put("userRole", userRole);

        tokenService.resetRefreshTokenJti(userId, jti);

        return Jwts
                .builder()
                .setSubject(REFRESH_TOKEN_SUBJECT)
                .setClaims(claims)
                .setId(jti)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValidityInSeconds * 1000))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public Jws<Claims> validateAccessToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(token);
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("jwt token expired");
        } catch (JwtException e) {
            throw new RuntimeException("invalid jwt token");
        }
    }

    public Jws<Claims> validateRefreshToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(token);
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("jwt token expired");
        } catch (JwtException e) {
            throw new RuntimeException("invalid jwt token");
        }
    }

    public JwtToken reissue(String refreshToken) {
        String userId = getUserIdFromToken(refreshToken);

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(()->new RuntimeException("user not found"));

        return JwtToken.builder()
                .accessToken(createAccessToken(user.getId().toString(), user.getUserRole()))
                .refreshToken(refreshRefreshToken(user.getId().toString(), user.getUserRole()))
                .build();
    }

    public String getUserIdFromToken(String token) {
        Jws<Claims> claims = validateRefreshToken(token);

        String jti = claims.getBody().getId();
        String userId = claims.getBody().get("userId", String.class);

        if (!tokenService.isRefreshTokenValid(userId, jti)){
            throw new RuntimeException("invalid jwt token");
        }

        return userId;
    }

    public String getAccessTokenFromHeader(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equalsIgnoreCase("access-token")) {
                    return cookie.getValue();
                }
            }
        }

        String header = request.getHeader(AUTHORIZATION);
        if (header != null) {
            if (!header.toLowerCase().startsWith(BEARER)) {
                throw new RuntimeException();
            }
            return header.substring(7);
        }

        return null;
    }
}
