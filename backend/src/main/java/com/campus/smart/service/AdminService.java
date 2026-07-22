package com.campus.smart.service;

import com.campus.smart.dto.RegistrationCodeDto;
import com.campus.smart.dto.RegistrationCodeRequest;
import com.campus.smart.dto.UserDto;
import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;

import java.util.List;

public interface AdminService {
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    UserDto updateUserRole(Long id, Role role);
    void deleteUser(Long id);

    // Onboarding validation codes
    RegistrationCodeDto generateCode(String adminEmail, RegistrationCodeRequest request);
    List<RegistrationCodeDto> getGeneratedCodes();
    org.springframework.data.domain.Page<RegistrationCodeDto> getGeneratedCodesPaginated(
            int page, int size, String search, String role, String status, String sortBy, String sortDir);
    RegistrationCodeDto revokeCode(Long id);
    
    // Onboarding approvals & status management
    UserDto updateUserStatus(Long id, UserStatus status);
}
