package com.qpgs.backend.service;

import com.qpgs.backend.dto.BulkUploadResponse;
import com.qpgs.backend.entity.Question;
import com.qpgs.backend.repository.QuestionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class BulkUploadService {

    @Autowired
    private QuestionRepository questionRepository;

    private static final Set<String> VALID_DIFFICULTIES = Set.of("EASY", "MEDIUM", "HARD");

    /**
     * Expected columns (row 1 = header, data starts row 2):
     * A: Question Text | B: Subject | C: Topic | D: Difficulty (EASY/MEDIUM/HARD) | E: Marks
     */
    public BulkUploadResponse parseAndSave(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        List<Question> toSave = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isRowEmpty(row)) continue;

                int displayRow = rowIndex + 1; // 1-based, matches what user sees in Excel

                String questionText = getCellString(row, 0);
                String subject = getCellString(row, 1);
                String topic = getCellString(row, 2);
                String difficulty = getCellString(row, 3);
                String marksRaw = getCellString(row, 4);

                if (isBlank(questionText) || isBlank(subject) || isBlank(topic)
                        || isBlank(difficulty) || isBlank(marksRaw)) {
                    errors.add("Row " + displayRow + ": all 5 columns are required.");
                    continue;
                }

                String normalizedDifficulty = difficulty.trim().toUpperCase();
                if (!VALID_DIFFICULTIES.contains(normalizedDifficulty)) {
                    errors.add("Row " + displayRow + ": difficulty must be EASY, MEDIUM, or HARD (got '" + difficulty + "').");
                    continue;
                }

                Integer marks;
                try {
                    marks = (int) Double.parseDouble(marksRaw.trim());
                    if (marks <= 0) {
                        errors.add("Row " + displayRow + ": marks must be a positive number.");
                        continue;
                    }
                } catch (NumberFormatException e) {
                    errors.add("Row " + displayRow + ": marks must be a number (got '" + marksRaw + "').");
                    continue;
                }

                Question q = new Question();
                q.setQuestionText(questionText.trim());
                q.setSubject(subject.trim());
                q.setTopic(topic.trim());
                q.setDifficultyLevel(normalizedDifficulty);
                q.setMarks(marks);
                toSave.add(q);
            }

        } catch (IOException e) {
            errors.add("Could not read the file. Make sure it's a valid .xlsx file.");
            return new BulkUploadResponse(0, errors.size(), errors);
        }

        if (!toSave.isEmpty()) {
            questionRepository.saveAll(toSave);
        }

        return new BulkUploadResponse(toSave.size(), errors.size(), errors);
    }

    public byte[] generateTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Questions");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row header = sheet.createRow(0);
            String[] columns = {"Question Text", "Subject", "Topic", "Difficulty (EASY/MEDIUM/HARD)", "Marks"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 6000);
            }

            Row example = sheet.createRow(1);
            example.createCell(0).setCellValue("What is polymorphism in Java?");
            example.createCell(1).setCellValue("Java");
            example.createCell(2).setCellValue("OOP");
            example.createCell(3).setCellValue("MEDIUM");
            example.createCell(4).setCellValue(5);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate template: " + e.getMessage(), e);
        }
    }

    private String getCellString(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < 5; i++) {
            if (!isBlank(getCellString(row, i))) return false;
        }
        return true;
    }
}