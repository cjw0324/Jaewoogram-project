package com.example.demo.domain.main.controller;

import com.example.demo.domain.main.controller.dto.MainResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/")
public class MainController {

    private static final String version = "v3.0.1";

    @GetMapping
    public ResponseEntity<MainResponseDto> mainIndex() {
        MainResponseDto response = new MainResponseDto(
                "HELLO JAE WOO Project : CI / CD with Github Action, Docker, AWS EC2, RDS, MySQL, S3, ElastiCache Redis, Oauth2.0, JWT,  Redis PUB/SUB, Redis Lock, Kafka, Web Socket",
                version,
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<MainResponseDto> test() {
        MainResponseDto response = new MainResponseDto(
                "Hello CI/CD with Docker!",
                version,
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );
        return ResponseEntity.ok(response);
    }
}