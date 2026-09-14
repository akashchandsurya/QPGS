package com.qpgs.backend.controller;

import com.qpgs.backend.dto.BulkUploadResponse;
import com.qpgs.backend.service.BulkUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/questions/bulk-upload")
@CrossOrigin(origins = "http://localhost:5173") // update to match your frontend port
public class BulkUploadController {

    @Autowired
    private BulkUploadService bulkUploadService;

    // POST upload an Excel file of questions
    @PostMapping
    public ResponseEntity<BulkUploadResponse> uploadQuestions(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new BulkUploadResponse(0, 1, java.util.List.of("File is empty."))
            );
        }
        BulkUploadResponse response = bulkUploadService.parseAndSave(file);
        return ResponseEntity.ok(response);
    }

    // GET download a sample template to fill in
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] templateBytes = bulkUploadService.generateTemplate();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=questions-template.xlsx")
                .body(templateBytes);
    }
}