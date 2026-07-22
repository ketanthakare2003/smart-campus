package com.campus.smart.dto;

import com.campus.smart.enums.Role;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationCodeRequest {

    @NotNull(message = "Target role is required")
    private Role targetRole;

    @Min(value = 1, message = "Expiration must be at least 1 hour")
    private int expirationHours = 24; // Default to 24 hours
}
