package com.qpgs.backend.service;

import com.qpgs.backend.dto.AnalyticsResponse;
import com.qpgs.backend.dto.DashboardStatsResponse;
import com.qpgs.backend.dto.UserResponse;
import com.qpgs.backend.entity.Question;
import com.qpgs.backend.entity.User;
import com.qpgs.backend.exception.ResourceNotFoundException;
import com.qpgs.backend.repository.GeneratedPaperRepository;
import com.qpgs.backend.repository.QuestionRepository;
import com.qpgs.backend.repository.RefreshTokenRepository;
import com.qpgs.backend.repository.SubjectRepository;
import com.qpgs.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private GeneratedPaperRepository generatedPaperRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getRole()))
                .collect(Collectors.toList());
    }

    public Page<UserResponse> getUsersPaginated(int page, int size, String keyword, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Page<User> userPage;

        if (keyword == null || keyword.trim().isEmpty()) {
            userPage = userRepository.findAll(pageable);
        } else {
            userPage = userRepository.searchUsers(keyword, pageable);
        }

        return userPage.map(u -> new UserResponse(u.getId(), u.getUsername(), u.getRole()));
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return new UserResponse(user.getId(), user.getUsername(), user.getRole());
    }

    public UserResponse updateUserRole(Long id, String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setRole(newRole.toUpperCase());
        userRepository.save(user);
        return new UserResponse(user.getId(), user.getUsername(), user.getRole());
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Clean up associated refresh token first to avoid foreign key violation
        try {
            refreshTokenRepository.deleteByUser(user);
        } catch (Exception ignored) {
            // Safe fallback if token doesn't exist
        }

        userRepository.delete(user);
    }

    public DashboardStatsResponse getDashboardStats() {
        return new DashboardStatsResponse(
                userRepository.count(),
                questionRepository.count(),
                subjectRepository.count(),
                generatedPaperRepository.count()
        );
    }

    public AnalyticsResponse getAnalytics() {
        List<Question> allQuestions = questionRepository.findAll();

        Map<String, Long> bySubject = allQuestions.stream()
                .collect(Collectors.groupingBy(Question::getSubject, LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> byDifficulty = allQuestions.stream()
                .collect(Collectors.groupingBy(Question::getDifficultyLevel, LinkedHashMap::new, Collectors.counting()));

        return new AnalyticsResponse(bySubject, byDifficulty);
    }
}