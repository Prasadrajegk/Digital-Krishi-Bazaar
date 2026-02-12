package com.demo.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ProductApiClient {

    private final RestTemplate restTemplate;

    public ProductApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String fetchProductsJson() {
        return restTemplate.getForObject(
                "http://localhost:8080/api/products",
                String.class
        );
    }
}
