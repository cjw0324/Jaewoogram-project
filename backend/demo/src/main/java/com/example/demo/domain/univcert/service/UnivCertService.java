package com.example.demo.domain.univcert.service;

import com.example.demo.domain.univcert.controller.dto.*;
import com.univcert.api.UnivCert;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UnivCertService {

    @Value("${univcert.api.key}")
    private String univ_cert_key;

    @CircuitBreaker(name = "univCertApi", fallbackMethod = "fallbackUnivCertify")
    @RateLimiter(name = "univCertApi", fallbackMethod = "fallbackUnivCertify")
    public CertifyResponse univCertify(CertifyRequest request) {
        try {
            Map<String, Object> map = UnivCert.certify(univ_cert_key, request.getEmail(), request.getUnivName(), false);
            return new CertifyResponse((Integer) map.get("code"), (Boolean) map.get("success"), (String) map.get("message"));
        } catch (IOException e) {
            throw new RuntimeException("Fail to univ cert api call");
        }
    }

    public CertifyResponse fallbackUnivCertify(CertifyRequest request, Throwable t) {
        return new CertifyResponse(503, false, "대학 인증 시스템이 일시적으로 중단되었습니다.");
    }

    @CircuitBreaker(name = "univCertApi", fallbackMethod = "fallbackUnivCodeCertify")
    @RateLimiter(name = "univCertApi", fallbackMethod = "fallbackUnivCodeCertify")
    public CertifyCodeResponse univCodeCertify(CertifyCodeRequest request) {
        try {
            Map<String, Object> map = UnivCert.certifyCode(univ_cert_key, request.getEmail(), request.getUnivName(), request.getCode());
            return new CertifyCodeResponse((Boolean) map.get("success"), (String) map.get("univName"), (String) map.get("certified_email"), (String) map.get("certified_date"), (Integer) map.get("code"), (String) map.get("message"));
        } catch (IOException e) {
            throw new RuntimeException("Fail to univ cert certify code api call");
        }
    }

    public CertifyCodeResponse fallbackUnivCodeCertify(CertifyCodeRequest request, Throwable t) {
        return new CertifyCodeResponse(false, null, null, null, 503, "대학 인증 코드 확인이 불가합니다. 잠시 후 다시 시도해주세요.");
    }

    @CircuitBreaker(name = "univCertApi", fallbackMethod = "fallbackUnivEmailCertCheck")
    @RateLimiter(name = "univCertApi", fallbackMethod = "fallbackUnivEmailCertCheck")
    public EmailCertCheckResponse univEmailCertCheck(EmailCertCheckRequest request) {
        try {
            Map<String, Object> map = UnivCert.status(univ_cert_key, request.getEmail());
            return new EmailCertCheckResponse((Boolean) map.get("success"), (String) map.get("certified_date"), (Integer) map.get("code"), "API 호출에 성공했습니다.");
        } catch (IOException ex) {
            throw new RuntimeException("Fail to univ email cert check api call");
        }
    }

    public EmailCertCheckResponse fallbackUnivEmailCertCheck(EmailCertCheckRequest request, Throwable t) {
        return new EmailCertCheckResponse(false, null, 503, "대학 인증 이메일 확인이 불가능합니다. 나중에 다시 시도해주세요.");
    }

    @CircuitBreaker(name = "univCertApi", fallbackMethod = "fallbackUnivCheck")
    @RateLimiter(name = "univCertApi", fallbackMethod = "fallbackUnivCheck")
    public UnivCheckResponse univCheck(UnivCheckRequest request) {
        try {
            Map<String, Object> map = UnivCert.check(request.getUnivName());
            return new UnivCheckResponse((Boolean) map.get("success"));
        } catch (IOException e) {
            throw new RuntimeException("Fail to univ check api call");
        }
    }

    public UnivCheckResponse fallbackUnivCheck(UnivCheckRequest request, Throwable t) {
        return new UnivCheckResponse(false); // 실패시 false 반환
    }
}
