
package com.qpgs.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Question text is required")
    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @NotBlank(message = "Subject is required")
    @Column(nullable = false)
    private String subject;

    @NotBlank(message = "Topic is required")
    @Column(nullable = false)
    private String topic;

    @NotBlank(message = "Difficulty level is required")
    @Column(name = "difficulty_level", nullable = false)
    private String difficultyLevel; // EASY, MEDIUM, HARD

    @NotNull(message = "Marks is required")
    @Positive(message = "Marks must be positive")
    @Column(nullable = false)
    private Integer marks;
}