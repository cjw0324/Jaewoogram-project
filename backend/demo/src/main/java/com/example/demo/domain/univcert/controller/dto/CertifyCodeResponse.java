package com.example.demo.domain.univcert.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CertifyCodeResponse {
    private boolean success;
    private String univName;
    private String certifiedEmail;
    private String certifiedDate;
    private Integer status;
    private String message;
}
