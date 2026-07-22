package com.campus.smart.service;

import com.campus.smart.dto.JwtResponse;
import com.campus.smart.dto.LoginRequest;
import com.campus.smart.dto.RegisterRequest;
import com.campus.smart.dto.UserDto;

public interface AuthService {
    UserDto registerUser(RegisterRequest registerRequest);
    JwtResponse loginUser(LoginRequest loginRequest);
}
