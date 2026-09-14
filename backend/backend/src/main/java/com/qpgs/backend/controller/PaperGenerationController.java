package com.qpgs.backend.controller;

import com.qpgs.backend.dto.PaperGenerationRequest;
import com.qpgs.backend.entity.GeneratedPaper;
import com.qpgs.backend.service.PaperGenerationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/papers")
@CrossOrigin(origins = "http://localhost:5173") // update to match your frontend port
public class PaperGenerationController {

    @Autowired
    private PaperGenerationService paperGenerationService;

    // POST generate a new randomized question paper
    @PostMapping("/generate")
    public ResponseEntity<GeneratedPaper> generatePaper(@Valid @RequestBody PaperGenerationRequest request) {
        GeneratedPaper paper = paperGenerationService.generatePaper(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(paper);
    }

    // GET all generated papers (admin reports)
    @GetMapping
    public ResponseEntity<List<GeneratedPaper>> getAllPapers() {
        return ResponseEntity.ok(paperGenerationService.getAllPapers());
    }

    // GET single generated paper with full question details
    @GetMapping("/{id}")
    public ResponseEntity<GeneratedPaper> getPaperById(@PathVariable Long id) {
        return ResponseEntity.ok(paperGenerationService.getPaperById(id));
    }

    // DELETE a generated paper (frees up its questions for deletion elsewhere)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaper(@PathVariable Long id) {
        paperGenerationService.deletePaper(id);
        return ResponseEntity.noContent().build();
    }
}