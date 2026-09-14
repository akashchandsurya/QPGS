package com.qpgs.backend.controller;

import com.qpgs.backend.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/papers")
@CrossOrigin(origins = "http://localhost:5173") // React dev server
public class ExportController {

    @Autowired
    private ExportService exportService;

    // GET download generated paper as PDF
    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] pdfBytes = exportService.exportToPdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=question-paper-" + id + ".pdf")
                .body(pdfBytes);
    }

    // GET download generated paper as Word (.docx)
    @GetMapping("/{id}/export/word")
    public ResponseEntity<byte[]> exportWord(@PathVariable Long id) {
        byte[] wordBytes = exportService.exportToWord(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=question-paper-" + id + ".docx")
                .body(wordBytes);
    }
}