package com.campus.smart.service.impl;

import com.campus.smart.event.SmartCampusEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.campus.smart.dto.DtoMapper;
import com.campus.smart.dto.NoticeDto;
import com.campus.smart.dto.StudentProfileDto;
import com.campus.smart.entity.Notice;
import com.campus.smart.entity.StudentProfile;
import com.campus.smart.entity.User;
import com.campus.smart.enums.UserStatus;
import com.campus.smart.exception.BadRequestException;
import com.campus.smart.exception.ResourceNotFoundException;
import com.campus.smart.repository.NoticeRepository;
import com.campus.smart.repository.StudentProfileRepository;
import com.campus.smart.repository.UserRepository;
import com.campus.smart.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyServiceImpl implements FacultyService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public List<StudentProfileDto> getAllStudents() {
        return studentProfileRepository.findAll().stream()
                .map(DtoMapper::toStudentProfileDto)
                .collect(Collectors.toList());
    }

    @Override
    public StudentProfileDto getStudentById(Long id) {
        StudentProfile student = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", id));
        return DtoMapper.toStudentProfileDto(student);
    }

    @Override
    @Transactional
    public StudentProfileDto updateStudentCgpa(Long id, Double newCgpa) {
        StudentProfile student = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", id));
        student.setCgpa(newCgpa);
        StudentProfile saved = studentProfileRepository.save(student);
        return DtoMapper.toStudentProfileDto(saved);
    }

    @Override
    public List<StudentProfileDto> getPendingStudents() {
        return studentProfileRepository.findAll().stream()
                .filter(st -> st.getUser().getStatus() == UserStatus.PENDING_VERIFICATION)
                .map(DtoMapper::toStudentProfileDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StudentProfileDto verifyStudent(Long id, String action) {
        StudentProfile student = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", id));

        User user = student.getUser();
        if (user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Error: Student registration is not in PENDING_VERIFICATION state.");
        }

        if ("APPROVE".equalsIgnoreCase(action)) {
            user.setStatus(UserStatus.PENDING_ADMIN_APPROVAL);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            user.setStatus(UserStatus.REJECTED);
        } else {
            throw new BadRequestException("Error: Invalid verification action. Use APPROVE or REJECT.");
        }

        userRepository.save(user);
        eventPublisher.publishEvent(new SmartCampusEvent(this, user, "Student Account Verified", "ONBOARDING", "Your student profile verification action is " + action, "Smart Campus - Student Verification Update", "<h2>Academic Profile Verification</h2><p>Your profile verification status is: <b>" + user.getStatus() + "</b></p>"));
        return DtoMapper.toStudentProfileDto(student);
    }

    @Override
    @Transactional
    public NoticeDto postNotice(String email, NoticeDto noticeDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Notice notice = Notice.builder()
                .title(noticeDto.getTitle())
                .content(noticeDto.getContent())
                .postedBy(user)
                .postedDate(LocalDateTime.now())
                .build();

        Notice saved = noticeRepository.save(notice);
        eventPublisher.publishEvent(new SmartCampusEvent(this, user, "Notice Published", "NOTICE", "Published notice: " + saved.getTitle(), "Smart Campus - Notice Board Updated", "<h2>New Notice Published</h2><p><b>Title:</b> " + saved.getTitle() + "</p>"));
        return DtoMapper.toNoticeDto(saved);
    }

    @Override
    public List<NoticeDto> getAllNotices() {
        return noticeRepository.findAllByOrderByPostedDateDesc().stream()
                .map(DtoMapper::toNoticeDto)
                .collect(Collectors.toList());
    }

    @Override
    public NoticeDto getNoticeById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        return DtoMapper.toNoticeDto(notice);
    }

    @Override
    @Transactional
    public void deleteNotice(Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notice", "id", id);
        }
        noticeRepository.deleteById(id);
    }
}
