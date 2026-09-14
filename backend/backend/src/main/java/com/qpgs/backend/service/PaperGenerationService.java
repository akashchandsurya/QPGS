package com.qpgs.backend.service;

import com.qpgs.backend.dto.PaperGenerationRequest;
import com.qpgs.backend.entity.GeneratedPaper;
import com.qpgs.backend.entity.Question;
import com.qpgs.backend.exception.InsufficientQuestionsException;
import com.qpgs.backend.exception.ResourceNotFoundException;
import com.qpgs.backend.repository.GeneratedPaperRepository;
import com.qpgs.backend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PaperGenerationService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private GeneratedPaperRepository generatedPaperRepository;

    public GeneratedPaper generatePaper(PaperGenerationRequest request) {
        List<Question> selectedQuestions = new ArrayList<>();

        selectedQuestions.addAll(pickRandomQuestions(request.getSubject(), "EASY", request.getEasyCount()));
        selectedQuestions.addAll(pickRandomQuestions(request.getSubject(), "MEDIUM", request.getMediumCount()));
        selectedQuestions.addAll(pickRandomQuestions(request.getSubject(), "HARD", request.getHardCount()));

        if (selectedQuestions.isEmpty()) {
            throw new InsufficientQuestionsException(
                    "At least one of easyCount, mediumCount, hardCount must be greater than 0");
        }

        int totalMarks = selectedQuestions.stream()
                .mapToInt(Question::getMarks)
                .sum();

        GeneratedPaper paper = new GeneratedPaper();
        paper.setSubject(request.getSubject());
        paper.setGeneratedBy(request.getGeneratedBy());
        paper.setGeneratedDate(LocalDateTime.now());
        paper.setTotalMarks(totalMarks);
        paper.setTotalQuestions(selectedQuestions.size());
        paper.setQuestions(selectedQuestions);

        return generatedPaperRepository.save(paper);
    }

    public List<GeneratedPaper> getAllPapers() {
        return generatedPaperRepository.findAll();
    }

    public GeneratedPaper getPaperById(Long id) {
        return generatedPaperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Generated paper not found with id: " + id));
    }

    public void deletePaper(Long id) {
        GeneratedPaper paper = getPaperById(id);
        generatedPaperRepository.delete(paper);
        // Hibernate automatically clears the matching paper_questions join rows
        // since GeneratedPaper owns the @ManyToMany relationship. The underlying
        // Question rows themselves are untouched.
    }

    private List<Question> pickRandomQuestions(String subject, String difficulty, Integer count) {
        if (count == null || count == 0) {
            return Collections.emptyList();
        }

        List<Question> available = questionRepository
                .findBySubjectIgnoreCaseAndDifficultyLevelIgnoreCase(subject, difficulty);

        if (available.size() < count) {
            throw new InsufficientQuestionsException(
                    "Not enough " + difficulty + " questions for subject '" + subject
                            + "'. Required: " + count + ", Available: " + available.size());
        }

        Collections.shuffle(available);
        return new ArrayList<>(available.subList(0, count));
    }
}