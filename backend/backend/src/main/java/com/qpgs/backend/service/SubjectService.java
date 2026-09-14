package com.qpgs.backend.service;

import com.qpgs.backend.entity.Subject;
import com.qpgs.backend.exception.ResourceInUseException;
import com.qpgs.backend.exception.ResourceNotFoundException;
import com.qpgs.backend.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // Naya paginated method
    public Page<Subject> getSubjectsPaginated(int page, int size, String keyword, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        if (keyword == null || keyword.trim().isEmpty()) {
            return subjectRepository.findAll(pageable);
        }
        return subjectRepository.searchSubjects(keyword, pageable);
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
    }

    public Subject createSubject(Subject subject) {
        Optional<Subject> existing = subjectRepository.findByNameIgnoreCase(subject.getName());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Subject with name '" + subject.getName() + "' already exists.");
        }
        return subjectRepository.save(subject);
    }

    public Subject updateSubject(Long id, Subject updatedSubject) {
        Subject existing = getSubjectById(id);

        Optional<Subject> duplicateCheck = subjectRepository.findByNameIgnoreCase(updatedSubject.getName());
        if (duplicateCheck.isPresent() && !duplicateCheck.get().getId().equals(id)) {
            throw new IllegalArgumentException("Another subject with name '" + updatedSubject.getName() + "' already exists.");
        }

        existing.setName(updatedSubject.getName());
        existing.setDescription(updatedSubject.getDescription());
        return subjectRepository.save(existing);
    }

    public void deleteSubject(Long id) {
        Subject existing = getSubjectById(id);
        try {
            subjectRepository.delete(existing);
            subjectRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResourceInUseException("Cannot delete '" + existing.getName() + "' - it is currently in use. Delete or reassign related items first.");
        }
    }
}