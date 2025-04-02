package com.example.demo.domain.basic.controller;

import com.example.demo.domain.basic.dto.MainResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/")
public class MainController {

    private static final String version = "v1.0.4";

    @GetMapping("/")
    public ResponseEntity<MainResponseDto> mainIndex() {
        MainResponseDto response = new MainResponseDto(
                "HELLO JAE WOO CI / CD with Github Action, Docker",
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