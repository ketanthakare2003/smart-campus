package com.campus.smart.dto;

import com.campus.smart.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegistrationCodeDto {
    private Long id;
    private String code;
    private Role targetRole;
    private boolean used;
    private LocalDateTime expiresAt;
    private UserDto generatedBy;
    private LocalDateTime createdDate;
}
