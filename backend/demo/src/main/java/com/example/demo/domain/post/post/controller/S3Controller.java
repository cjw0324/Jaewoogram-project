package com.example.demo.domain.post.post.controller;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.amazonaws.HttpMethod;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3Controller {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @PostMapping("/presigned-urls")
    public List<Map<String, String>> generatePresignedUrls(@RequestBody List<FileRequest> files) {
        return files.stream().map(file -> {
            String key = "uploads/" + UUID.randomUUID() + "_" + file.getFilename();

            GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucket, key)
                    .withMethod(HttpMethod.PUT)
                    .withExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 5)); // 5분 유효

            URL presignedUrl = amazonS3.generatePresignedUrl(request);

            Map<String, String> result = new HashMap<>();
            result.put("url", presignedUrl.toString());
            result.put("s3Url", "https://" + bucket + ".s3.amazonaws.com/" + key);
            return result;
        }).collect(Collectors.toList());
    }

    @Data
    public static class FileRequest {
        private String filename;
        private String contentType;
    }
}
