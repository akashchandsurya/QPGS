package com.qpgs.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "generated_papers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(name = "generated_by", nullable = false)
    private String generatedBy;

    @Column(name = "generated_date", nullable = false)
    private LocalDateTime generatedDate;

    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @ManyToMany
    @JoinTable(
            name = "paper_questions",
            joinColumns = @JoinColumn(name = "paper_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    private List<Question> questions;
}