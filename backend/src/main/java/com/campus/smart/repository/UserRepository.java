package com.campus.smart.repository;

import com.campus.smart.entity.User;
import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    long countByRole(Role role);
    long countByRoleAndStatus(Role role, UserStatus status);
    List<User> findByRole(Role role);
}
