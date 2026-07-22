package com.campus.smart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoticeDto {
    private Long id;
    private String title;
    private String content;
    private UserDto postedBy;
    private LocalDateTime postedDate;
}
