package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/test")
public class TestController {

    private static final String version = "v1.0.1";

    @GetMapping
    public String test() {
        return "Hello CI/CD with Docker! version : " + version + "local time : " + LocalDateTime.now();
    }
}
