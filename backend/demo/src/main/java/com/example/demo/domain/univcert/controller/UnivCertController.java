package com.example.demo.domain.univcert.controller;

import com.example.demo.domain.univcert.controller.dto.*;
import com.example.demo.domain.univcert.service.UnivCertService;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/univ-cert")
@RequiredArgsConstructor
public class UnivCertController {

    private final UnivCertService univCertService;

    @PostMapping("/certify")
    public ResponseEntity<CertifyResponse> univCertify(@RequestBody CertifyRequest request) {
        return ResponseEntity.ok(univCertService.univCertify(request));
    }

    @PostMapping("/certify-code")
    public ResponseEntity<CertifyCodeResponse> univCodeCertify(@RequestBody CertifyCodeRequest request) {
        return ResponseEntity.ok(univCertService.univCodeCertify(request));
    }

    @PostMapping("/certify-status")
    public ResponseEntity<EmailCertCheckResponse> univEmailCertCheck(@RequestBody EmailCertCheckRequest request) {
        return ResponseEntity.ok(univCertService.univEmailCertCheck(request));
    }

    @PostMapping("/univ-check")
    public ResponseEntity<UnivCheckResponse> univCheck(@RequestBody UnivCheckRequest request) {
        return ResponseEntity.ok(univCertService.univCheck(request));
    }
}
