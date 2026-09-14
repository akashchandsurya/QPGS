package com.qpgs.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResponse {
    private int successCount;
    private int failCount;
    private List<String> errors; // e.g. "Row 4: marks must be a positive number"
}