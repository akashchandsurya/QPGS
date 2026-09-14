package com.qpgs.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaperGenerationRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "generatedBy (faculty/admin username) is required")
    private String generatedBy;

    @NotNull(message = "easyCount is required (use 0 if none)")
    @Min(value = 0, message = "easyCount cannot be negative")
    private Integer easyCount;

    @NotNull(message = "mediumCount is required (use 0 if none)")
    @Min(value = 0, message = "mediumCount cannot be negative")
    private Integer mediumCount;

    @NotNull(message = "hardCount is required (use 0 if none)")
    @Min(value = 0, message = "hardCount cannot be negative")
    private Integer hardCount;
}