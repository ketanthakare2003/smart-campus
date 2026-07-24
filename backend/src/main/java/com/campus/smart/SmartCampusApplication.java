package com.campus.smart;

import com.campus.smart.entity.User;
import com.campus.smart.enums.Role;
import com.campus.smart.enums.UserStatus;
import com.campus.smart.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByEmail("admin@campus.edu").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode("Admin@SmartCampus2026"));
                    admin.setStatus(UserStatus.ACTIVE);
                    userRepository.save(admin);
                    System.out.println(">>> Default Admin User Password Updated Successfully! <<<");
                },
                () -> {
                    User admin = User.builder()
                            .fullName("Campus Administrator")
                            .email("admin@campus.edu")
                            .password(passwordEncoder.encode("Admin@SmartCampus2026"))
                            .role(Role.ADMIN)
                            .status(UserStatus.ACTIVE)
                            .build();
                    userRepository.save(admin);
                    System.out.println(">>> Default Admin User Created Successfully! <<<");
                }
            );
        };
    }
}
