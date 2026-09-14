package com.qpgs.backend.service;

import com.qpgs.backend.entity.Question;
import com.qpgs.backend.exception.ResourceInUseException;
import com.qpgs.backend.exception.ResourceNotFoundException;
import com.qpgs.backend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Page<Question> getQuestionsPaginated(int page, int size, String keyword, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        if (keyword == null || keyword.trim().isEmpty()) {
            return questionRepository.findAll(pageable);
        }
        return questionRepository.searchQuestions(keyword, pageable);
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
    }

    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    public Question updateQuestion(Long id, Question updatedQuestion) {
        Question existing = getQuestionById(id);
        existing.setQuestionText(updatedQuestion.getQuestionText());
        existing.setSubject(updatedQuestion.getSubject());
        existing.setTopic(updatedQuestion.getTopic());
        existing.setDifficultyLevel(updatedQuestion.getDifficultyLevel());
        existing.setMarks(updatedQuestion.getMarks());
        return questionRepository.save(existing);
    }

    public void deleteQuestion(Long id) {
        Question existing = getQuestionById(id);
        try {
            questionRepository.delete(existing);
            questionRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResourceInUseException(
                    "This question is part of one or more generated papers and cannot be deleted."
            );
        }
    }

    public List<Question> getBySubject(String subject) {
        return questionRepository.findBySubjectIgnoreCase(subject);
    }

    public List<Question> getBySubjectAndDifficulty(String subject, String difficulty) {
        return questionRepository.findBySubjectIgnoreCaseAndDifficultyLevelIgnoreCase(subject, difficulty);
    }

    public List<Question> getByTopic(String topic) {
        return questionRepository.findByTopicIgnoreCase(topic);
    }

    public List<Question> getByDifficulty(String difficulty) {
        return questionRepository.findByDifficultyLevelIgnoreCase(difficulty);
    }
}