package com.qpgs.backend.controller;

import com.qpgs.backend.entity.Question;
import com.qpgs.backend.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // GET all questions (non-paginated, legacy)
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    // GET paginated & searched questions
    @GetMapping("/paged")
    public ResponseEntity<Page<Question>> getQuestionsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "id") String sortBy) {
        return ResponseEntity.ok(questionService.getQuestionsPaginated(page, size, keyword, sortBy));
    }

    // GET single question by id
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    // POST create new question
    @PostMapping
    public ResponseEntity<Question> createQuestion(@Valid @RequestBody Question question) {
        Question saved = questionService.createQuestion(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT update existing question
    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @Valid @RequestBody Question question) {
        return ResponseEntity.ok(questionService.updateQuestion(id, question));
    }

    // DELETE question
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // GET questions filtered by subject
    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Question>> getBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(questionService.getBySubject(subject));
    }

    // GET questions filtered by subject + difficulty
    @GetMapping("/subject/{subject}/difficulty/{difficulty}")
    public ResponseEntity<List<Question>> getBySubjectAndDifficulty(
            @PathVariable String subject, @PathVariable String difficulty) {
        return ResponseEntity.ok(questionService.getBySubjectAndDifficulty(subject, difficulty));
    }

    // GET questions filtered by topic
    @GetMapping("/topic/{topic}")
    public ResponseEntity<List<Question>> getByTopic(@PathVariable String topic) {
        return ResponseEntity.ok(questionService.getByTopic(topic));
    }

    // GET questions filtered by difficulty
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Question>> getByDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(questionService.getByDifficulty(difficulty));
    }
}