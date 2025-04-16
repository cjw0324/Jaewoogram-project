package com.example.demo.domain.main.controller;

import com.example.demo.domain.main.controller.dto.MainResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/")
public class MainController {

    private static final String version = "v4.0.1";

    @GetMapping
    public ResponseEntity<MainResponseDto> mainIndex() {
        MainResponseDto response = new MainResponseDto(
                String.join("\n", List.of(
                        "HELLO Jaewoo Project : Instagram Clone Toy project\n",

                        "📦 Deploy",
                        "Github Action CI / CD, Docker, AWS EC2\n",

                        "🛢️ Database & Storage",
                        "AWS RDS, MySQL, AWS S3, AWS ElastiCache - Redis\n",

                        "🔐 Auth & Security",
                        "OAuth2.0, JWT, Redis Distributed Lock\n",

                        "📡 Communication & Messaging",
                        "Asynchronous : Kafka, Redis PUB/SUB, WebSocket\n",

                        "🔍 Search & Logging",
                        "Elasticsearch, Kibana\n",

                        "📈 Monitoring",
                        "Prometheus, Grafana\n"
                )),
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