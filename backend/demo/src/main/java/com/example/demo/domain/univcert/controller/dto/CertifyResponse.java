package com.example.demo.domain.univcert.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CertifyResponse {
    private Integer status;
    private boolean success;
    private String message;
}
