package com.example.demo.global.config;

import com.example.demo.global.auth.jwt.JwtAuthEntryPoint;
import com.example.demo.global.auth.jwt.JwtAuthenticationFilter;
import com.example.demo.global.auth.jwt.JwtProvider;
import com.example.demo.global.auth.oauth2.CustomOAuth2UserService;
import com.example.demo.global.auth.oauth2.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final CustomOAuth2UserService oAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtProvider jwtProvider;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }

    @Bean
    public JwtAuthEntryPoint jwtAuthEntryPoint() {
        return new JwtAuthEntryPoint();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/","/oauth2/**", "/login/**", "/auth/reissue", "/auth/logout", "/api/s3/**", "/swagger-ui/**", "/v3/api-docs/**", "https://univcert.com/**", "/api/swagger-ui/**", "/api/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> {
                    oauth.userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService));
                    oauth.successHandler(oAuth2SuccessHandler);
                })
                .exceptionHandling(e -> e.authenticationEntryPoint(jwtAuthEntryPoint()));

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
