package com.demo.controller;

import com.demo.services.QnaService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/qna")
public class QnaController {

    private final QnaService qnaService;

    public QnaController(QnaService qnaService) {
        this.qnaService = qnaService;
    }

    @PostMapping
    public Map<String, String> ask(@RequestBody Map<String, String> body) {

        String question = body.get("question");
        String answer = qnaService.answerQuestion(question);

        return Map.of("answer", answer);
    }
}
