package com.qpgs.backend.repository;

import com.qpgs.backend.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findBySubjectIgnoreCase(String subject);
    List<Question> findBySubjectIgnoreCaseAndDifficultyLevelIgnoreCase(String subject, String difficulty);
    List<Question> findByTopicIgnoreCase(String topic);
    List<Question> findByDifficultyLevelIgnoreCase(String difficulty);

    @Query("SELECT q FROM Question q WHERE " +
            "LOWER(q.questionText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(q.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(q.topic) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Question> searchQuestions(@Param("keyword") String keyword, Pageable pageable);
}