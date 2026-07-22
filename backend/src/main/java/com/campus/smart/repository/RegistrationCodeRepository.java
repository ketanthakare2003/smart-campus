package com.campus.smart.repository;

import com.campus.smart.entity.RegistrationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationCodeRepository extends JpaRepository<RegistrationCode, Long> {
    Optional<RegistrationCode> findByCode(String code);
    List<RegistrationCode> findAllByOrderByExpiresAtDesc();
    List<RegistrationCode> findByGeneratedById(Long userId);
}
