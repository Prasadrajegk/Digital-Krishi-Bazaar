package com.demo.services;

import com.demo.dto.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        "gemini-3-flash-preview:generateContent?key=%s";

    private final RestTemplate restTemplate = new RestTemplate();

    public String askGemini(String prompt) {

        Map<String, Object> body = Map.of(
            "contents", new Object[]{
                Map.of("parts", new Object[]{
                    Map.of("text", prompt)
                })
            }
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
            new HttpEntity<>(body, headers);

        ResponseEntity<GeminiResponse> response =
            restTemplate.postForEntity(
                String.format(GEMINI_URL, apiKey),
                request,
                GeminiResponse.class
            );

        return extractAnswer(response.getBody());
    }

    private String extractAnswer(GeminiResponse response) {
        if (response == null ||
            response.candidates == null ||
            response.candidates.isEmpty()) {
            return "No answer available.";
        }

        return response.candidates.get(0)
                .content.parts.get(0).text.trim();
    }
}
