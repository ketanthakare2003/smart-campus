package com.campus.smart.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI smartCampusOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Campus Management System API")
                        .description("REST API specifications for Student, Faculty, Company, TPO, and Admin modules")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Campus Placement Support")
                                .email("support@smartcampus.edu")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
    }

    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");
    }
}
