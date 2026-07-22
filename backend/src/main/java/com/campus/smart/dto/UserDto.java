package com.campus.smart.dto;

import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private UserStatus status;
}
