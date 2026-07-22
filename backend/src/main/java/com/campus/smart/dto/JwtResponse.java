package com.campus.smart.dto;

import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private UserStatus status;
}
