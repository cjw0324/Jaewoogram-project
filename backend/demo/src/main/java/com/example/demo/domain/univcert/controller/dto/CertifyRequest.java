package com.example.demo.domain.univcert.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CertifyRequest {
    private String email;
    private String univName;
}
