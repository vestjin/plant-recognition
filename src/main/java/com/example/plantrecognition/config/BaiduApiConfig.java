package com.example.plantrecognition.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BaiduApiConfig {
    @Value("${baidu.api.key}")
    private String apiKey;

    @Value("${baidu.secret.key}")
    private String secretKey;

    public String getApiKey() {
        return apiKey;
    }

    public String getSecretKey() {
        return secretKey;
    }
}