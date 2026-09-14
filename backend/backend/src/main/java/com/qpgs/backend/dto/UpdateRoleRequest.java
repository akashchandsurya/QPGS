package com.qpgs.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateRoleRequest {

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "ADMIN|FACULTY", message = "Role must be ADMIN or FACULTY")
    private String role;
}
