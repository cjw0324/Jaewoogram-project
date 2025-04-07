package com.example.demo.domain.univcert.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmailCertCheckResponse {
    private boolean success;
    private String certifiedDate;
    private Integer status;
    private String message;
}
