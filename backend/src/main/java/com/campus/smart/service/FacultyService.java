package com.campus.smart.service;

import com.campus.smart.dto.NoticeDto;
import com.campus.smart.dto.StudentProfileDto;

import java.util.List;

public interface FacultyService {
    List<StudentProfileDto> getAllStudents();
    StudentProfileDto getStudentById(Long id);
    StudentProfileDto updateStudentCgpa(Long id, Double newCgpa);
    
    // Onboarding approvals
    List<StudentProfileDto> getPendingStudents();
    StudentProfileDto verifyStudent(Long id, String action);
    
    // Notice board
    NoticeDto postNotice(String email, NoticeDto noticeDto);
    List<NoticeDto> getAllNotices();
    NoticeDto getNoticeById(Long id);
    void deleteNotice(Long id);
}
