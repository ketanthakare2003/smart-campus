import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import NoticeBoard from './pages/NoticeBoard';
import CreateNotice from './pages/CreateNotice';
import PlacementDrives from './pages/PlacementDrives';
import CreatePlacementDrive from './pages/CreatePlacementDrive';

// Student Pages
import StudentProfileView from './pages/StudentProfileView';
import StudentJobsBoard from './pages/StudentJobsBoard';
import StudentApplications from './pages/StudentApplications';

// Company Pages
import CompanyProfileView from './pages/CompanyProfileView';
import CreateJob from './pages/CreateJob';
import CompanyJobsList from './pages/CompanyJobsList';
import ApplicantsTracker from './pages/ApplicantsTracker';

// Faculty Pages
import FacultyStudentsList from './pages/FacultyStudentsList';
import VerifyStudents from './pages/VerifyStudents';

// TPO Pages
import TpoCompaniesList from './pages/TpoCompaniesList';

// Admin Pages
import AdminUsersList from './pages/AdminUsersList';
import AdminApprovals from './pages/AdminApprovals';
import AdminCodes from './pages/AdminCodes';

const HomeRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'STUDENT':
      return <Navigate to="/student/profile" replace />;
    case 'FACULTY':
      return <Navigate to="/faculty/students" replace />;
    case 'COMPANY':
      return <Navigate to="/company/profile" replace />;
    case 'TPO':
      return <Navigate to="/tpo/companies" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/users" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes Wrapper */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/dashboard" element={<HomeRedirect />} />

                    {/* Shared Protected Pages */}
                    <Route path="/notices" element={<NoticeBoard />} />
                    <Route path="/drives" element={<PlacementDrives />} />

                    {/* Student Protected Pages */}
                    <Route
                      path="/student/profile"
                      element={
                        <ProtectedRoute allowedRoles={['STUDENT']}>
                          <StudentProfileView />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/student/jobs"
                      element={
                        <ProtectedRoute allowedRoles={['STUDENT']}>
                          <StudentJobsBoard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/student/applications"
                      element={
                        <ProtectedRoute allowedRoles={['STUDENT']}>
                          <StudentApplications />
                        </ProtectedRoute>
                      }
                    />

                    {/* Faculty Protected Pages */}
                    <Route
                      path="/faculty/students"
                      element={
                        <ProtectedRoute allowedRoles={['FACULTY', 'TPO', 'ADMIN']}>
                          <FacultyStudentsList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/faculty/verify"
                      element={
                        <ProtectedRoute allowedRoles={['FACULTY', 'TPO', 'ADMIN']}>
                          <VerifyStudents />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/faculty/notices/new"
                      element={
                        <ProtectedRoute allowedRoles={['FACULTY', 'TPO', 'ADMIN']}>
                          <CreateNotice />
                        </ProtectedRoute>
                      }
                    />

                    {/* Company Protected Pages */}
                    <Route
                      path="/company/profile"
                      element={
                        <ProtectedRoute allowedRoles={['COMPANY']}>
                          <CompanyProfileView />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/company/jobs/new"
                      element={
                        <ProtectedRoute allowedRoles={['COMPANY']}>
                          <CreateJob />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/company/jobs"
                      element={
                        <ProtectedRoute allowedRoles={['COMPANY']}>
                          <CompanyJobsList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/company/applicants"
                      element={
                        <ProtectedRoute allowedRoles={['COMPANY']}>
                          <ApplicantsTracker />
                        </ProtectedRoute>
                      }
                    />

                    {/* TPO Protected Pages */}
                    <Route
                      path="/tpo/companies"
                      element={
                        <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
                          <TpoCompaniesList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tpo/drives"
                      element={
                        <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
                          <PlacementDrives />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tpo/drives/new"
                      element={
                        <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
                          <CreatePlacementDrive />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tpo/drives/edit/:id"
                      element={
                        <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
                          <CreatePlacementDrive />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Protected Pages */}
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminUsersList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/approvals"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminApprovals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/codes"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminCodes />
                        </ProtectedRoute>
                      }
                    />

                    {/* Fallback for unconfigured routes */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
