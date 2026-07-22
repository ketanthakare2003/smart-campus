import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { 
  Hash, BookOpen, Award, Calendar, Code, FileText, 
  CheckCircle2, Edit2, Save, X, ExternalLink, AlertTriangle, 
  Layers, FileSignature, Link as LinkIcon, Briefcase, Bell, 
  Download
} from 'lucide-react';

interface JobApplication {
  id: number;
  status: 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
}

const StudentProfileView: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [cgpa, setCgpa] = useState(0.0);
  const [graduationBatch, setGraduationBatch] = useState<number | ''>('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // UI state management
  const [savedData, setSavedData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Verification and User States
  const [userStatus, setUserStatus] = useState('PENDING_VERIFICATION');

  // Statistics counters
  const [stats, setStats] = useState({
    applied: 0,
    selected: 0,
    shortlisted: 0,
    pending: 0
  });
  const [noticesCount, setNoticesCount] = useState(0);
  const [drivesCount, setDrivesCount] = useState(0);
  const [eligibilityCounts, setEligibilityCounts] = useState({
    eligible: 0,
    ineligible: 0
  });

  const fetchProfileAndStats = async () => {
    try {
      const profileResponse = await api.get('/student/profile');
      const profile = profileResponse.data;
      
      const data = {
        fullName: profile.user.fullName,
        email: profile.user.email,
        rollNumber: profile.rollNumber || '',
        department: profile.department || '',
        cgpa: profile.cgpa || 0.0,
        graduationBatch: profile.graduationBatch || '',
        skills: profile.skills || '',
        resumeUrl: profile.resumeUrl || '',
      };

      setSavedData(data);
      setFullName(data.fullName);
      setEmail(data.email);
      setRollNumber(data.rollNumber);
      setDepartment(data.department);
      setCgpa(data.cgpa);
      setGraduationBatch(data.graduationBatch);
      setSkills(data.skills);
      setResumeUrl(data.resumeUrl);
      
      setUserStatus(profile.user.status || 'PENDING_VERIFICATION');

      // Fetch Applications Stats
      try {
        const appsResponse = await api.get('/student/applications');
        const apps: JobApplication[] = appsResponse.data;
        setStats({
          applied: apps.length,
          selected: apps.filter(a => a.status === 'SELECTED').length,
          shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
          pending: apps.filter(a => a.status === 'APPLIED').length
        });
      } catch (err) {
        console.error("Failed to load application statistics", err);
      }

      // Fetch Notices Stats
      try {
        const noticesResponse = await api.get('/faculty/notices');
        setNoticesCount(noticesResponse.data.length);
      } catch (err) {
        console.error("Failed to load notices list", err);
      }

      // Fetch Active Drives
      try {
        const drivesResponse = await api.get('/tpo/drives');
        setDrivesCount(drivesResponse.data.length);
      } catch (err) {
        console.error("Failed to load placement drives list", err);
      }

      // Fetch Job Eligibility Counts
      try {
        const jobsResponse = await api.get('/student/jobs');
        const jobsList = jobsResponse.data;
        setEligibilityCounts({
          eligible: jobsList.filter((j: any) => j.eligible).length,
          ineligible: jobsList.filter((j: any) => !j.eligible).length
        });
      } catch (err) {
        console.error("Failed to load jobs list for eligibility mapping", err);
      }

      // Default to edit mode only if new profile has zero data
      const isIncomplete = !data.rollNumber || !data.department || !data.graduationBatch || !data.resumeUrl || data.cgpa === 0.0;
      setIsEditMode(isIncomplete);
    } catch (err: any) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const calculateCompletion = () => {
    let completed = 0;
    if (rollNumber) completed += 20;
    if (department) completed += 20;
    if (cgpa > 0.0) completed += 20;
    if (graduationBatch) completed += 20;
    if (resumeUrl) completed += 20;
    return completed;
  };

  const completionPercentage = calculateCompletion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const payload = {
      user: { fullName },
      rollNumber: rollNumber || null,
      department,
      cgpa: Number(cgpa),
      graduationBatch: graduationBatch !== '' ? Number(graduationBatch) : null,
      skills,
      resumeUrl
    };

    try {
      await api.put('/student/profile', payload);
      setMessage('Profile updated successfully.');
      
      const updatedData = {
        fullName,
        email,
        rollNumber,
        department,
        cgpa: Number(cgpa),
        graduationBatch: graduationBatch !== '' ? Number(graduationBatch) : '',
        skills,
        resumeUrl
      };
      setSavedData(updatedData);
      setIsEditMode(false);
      
      // Reload details to verify eligibility calculations
      fetchProfileAndStats();
      
      setTimeout(() => {
        setMessage('');
      }, 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (savedData) {
      setFullName(savedData.fullName);
      setRollNumber(savedData.rollNumber);
      setDepartment(savedData.department);
      setCgpa(savedData.cgpa);
      setGraduationBatch(savedData.graduationBatch);
      setSkills(savedData.skills);
      setResumeUrl(savedData.resumeUrl);
    }
    setIsEditMode(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // Checklist verification states
  const hasAcademic = !!(rollNumber && department);
  const hasResume = !!resumeUrl;
  const hasSkills = !!skills;
  const isVerified = userStatus === 'ACTIVE';
  const isPlacementReady = hasAcademic && hasResume && hasSkills && isVerified;

  // Split skills into a nice array for rendering chips
  const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 px-2">
      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400">
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-450">
          <CheckCircle2 className="h-4 w-4 text-emerald-450" />
          <span>{message}</span>
        </div>
      )}

      {/* ========================================================
          1. VIEW MODE (Default premium enterprise ERP layout)
          ======================================================== */}
      {!isEditMode && (
        <div className="space-y-3.5 animate-in fade-in duration-300">
          
          {/* Student Header Card */}
          <div className="glass rounded-xl border border-slate-800/80 overflow-hidden relative shadow-lg">
            <div className="h-14 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-850"></div>
            <div className="p-4 pt-0 relative flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              
              {/* Profile Details Grid */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 -mt-7 w-full">
                <div className="h-16 w-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-2xl font-extrabold shadow-md select-none shrink-0 bg-gradient-to-br from-indigo-650 to-indigo-850">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left space-y-1 pb-1 w-full grid grid-cols-1 md:grid-cols-4 gap-3 pt-7 md:pt-8">
                  {/* Name and Basic Title */}
                  <div className="md:col-span-2 space-y-0.5">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">{fullName}</h2>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.2 text-3xs font-semibold ${
                        isVerified
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {isVerified ? '✓ Active Scholar' : 'Pending Verification'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{email}</p>
                    <p className="text-3xs text-slate-500 font-mono">Last Updated: Recently</p>
                  </div>

                  {/* Academic Parameters */}
                  <div className="text-xs space-y-0.5 text-slate-350 self-center">
                    <p><span className="text-slate-500">ID / Roll No:</span> <span className="font-bold text-slate-200">{rollNumber || 'Not Set'}</span></p>
                    <p><span className="text-slate-500">Department:</span> <span className="font-semibold text-slate-200">{department || 'Not Set'}</span></p>
                  </div>

                  {/* CGPA & Batch info */}
                  <div className="text-xs space-y-0.5 text-slate-350 self-center">
                    <p><span className="text-slate-500">Current CGPA:</span> <span className="font-bold text-indigo-400">{cgpa > 0.0 ? `${cgpa.toFixed(2)}/10` : 'Not Set'}</span></p>
                    <p><span className="text-slate-500">Graduation Batch:</span> <span className="font-semibold text-slate-200">{graduationBatch || 'Not Set'}</span></p>
                  </div>
                </div>
              </div>

              {/* Edit Trigger Button */}
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1 rounded-lg bg-indigo-650 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-600 transition-colors shrink-0 md:mt-6"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass p-3 rounded-xl border border-slate-800/60 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Jobs Applied</span>
                <span className="text-xl font-bold text-white block mt-0.5">{stats.applied}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3 rounded-xl border border-slate-800/60 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Placement Drives</span>
                <span className="text-xl font-bold text-white block mt-0.5">{drivesCount}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Calendar className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3 rounded-xl border border-slate-800/60 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Active Notices</span>
                <span className="text-xl font-bold text-white block mt-0.5">{noticesCount}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Bell className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3 rounded-xl border border-slate-800/60 flex flex-col justify-center gap-1 hover:border-slate-700/60 transition-all">
              <div className="flex items-center justify-between text-3xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Profile Completion</span>
                <span className="text-indigo-400">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-850">
                <div 
                  className="bg-indigo-500 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Split Dashboard */}
          <div className="grid gap-3.5 lg:grid-cols-10 items-start">
            
            {/* Left Column (35% - Cols 3.5) */}
            <div className="lg:col-span-4 space-y-3.5">
              
              {/* Profile Strength Checklist */}
              <div className="glass p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white border-b border-slate-850 pb-1.5">Profile Checklist</h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Academic Details Complete</span>
                    {hasAcademic ? (
                      <span className="text-emerald-450 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">✓ Completed</span>
                    ) : (
                      <span className="text-rose-455 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">✕ Missing</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Placement Resume Uploaded</span>
                    {hasResume ? (
                      <span className="text-emerald-450 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">✓ Uploaded</span>
                    ) : (
                      <span className="text-rose-455 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">✕ Missing</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Skills & Core Tags Added</span>
                    {hasSkills ? (
                      <span className="text-emerald-450 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">✓ Added</span>
                    ) : (
                      <span className="text-rose-455 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">✕ Missing</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Faculty/TPO Verified Account</span>
                    {isVerified ? (
                      <span className="text-emerald-450 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">✓ Verified</span>
                    ) : (
                      <span className="text-amber-450 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">⚠ Pending</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-850 pt-2 font-bold">
                    <span className="text-slate-200">Placement Ready Status</span>
                    {isPlacementReady ? (
                      <span className="text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Eligible for Drives</span>
                    ) : (
                      <span className="text-rose-455 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">Not Eligible Yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Placement Eligibility Summary Card */}
              <div className="glass p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white border-b border-slate-850 pb-1.5">Placement Eligibility Summary</h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CGPA Threshold Checked</span>
                    <span className="font-semibold text-slate-200">{cgpa >= 6.0 ? 'Yes (Pass)' : 'Needs Improvement'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department Registered</span>
                    <span className="font-semibold text-slate-200">{department || 'None'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Eligible Companies Count</span>
                    <span className="font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-full">{eligibilityCounts.eligible}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ineligible Companies Count</span>
                    <span className="font-bold text-rose-455 bg-rose-500/10 px-2 py-0.5 rounded-full">{eligibilityCounts.ineligible}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (65% - Cols 6.5) */}
            <div className="lg:col-span-6 space-y-3.5">
              
              {/* Academic Profile Details Grid */}
              <div className="glass p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-850 pb-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  Academic Profile
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center gap-2">
                    <Hash className="h-4 w-4 text-indigo-400" />
                    <div>
                      <span className="text-3xs text-slate-500 uppercase block font-semibold">Roll Number</span>
                      <span className="text-xs font-bold text-slate-200">{rollNumber || 'Not Set'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <div>
                      <span className="text-3xs text-slate-500 uppercase block font-semibold">Department</span>
                      <span className="text-xs font-bold text-slate-200 truncate">{department || 'Not Set'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center gap-2">
                    <Award className="h-4 w-4 text-indigo-400" />
                    <div>
                      <span className="text-3xs text-slate-500 uppercase block font-semibold">Cumulative CGPA</span>
                      <span className="text-xs font-bold text-slate-200">{cgpa > 0.0 ? `${cgpa.toFixed(2)}/10.00` : 'Not Set'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    <div>
                      <span className="text-3xs text-slate-500 uppercase block font-semibold">Graduation Year</span>
                      <span className="text-xs font-bold text-slate-200">{graduationBatch || 'Not Set'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills section */}
              <div className="glass p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-850 pb-1.5">
                  <Code className="h-4 w-4 text-indigo-400" />
                  Skills & Core Competencies
                </h3>

                {skillsArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto pr-1">
                    {skillsArray.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-3xs font-semibold hover:scale-105 transition-transform duration-200 select-none cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No skills listed yet. Click edit to add them.</p>
                )}
              </div>

              {/* Resume Section */}
              <div className="glass p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-850 pb-1.5">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Uploaded Resume Details
                </h3>

                {resumeUrl ? (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-850 overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-1.5 bg-indigo-550/10 border border-indigo-500/20 rounded text-indigo-400 shrink-0">
                        <FileSignature className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-xs text-slate-200 block truncate">Google Drive / File Resume</span>
                        <span className="text-3xs text-slate-550 block truncate font-mono">{resumeUrl}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a 
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 rounded-lg bg-indigo-650 px-3 py-1.5 text-2xs font-semibold text-white shadow hover:bg-indigo-600 transition-all"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                      <a 
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-2xs font-semibold text-slate-300 hover:bg-slate-700 transition-all border border-slate-700"
                        title="Download Resume Link"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 text-2xs text-rose-455 bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>No resume file linked. Please enter your resume PDF url in edit mode. An active resume is required to apply for jobs.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. EDIT MODE (Separate clean input profile form)
          ======================================================== */}
      {isEditMode && (
        <form onSubmit={handleSubmit} className="glass p-5 rounded-xl border border-slate-800 space-y-4 max-w-3xl mx-auto animate-in fade-in duration-300">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Profile Details</h2>
            <p className="text-xs text-slate-400">Configure your student record variables for recruiter eligibility screenings</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-slate-350">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="rollNumber" className="block text-xs font-medium text-slate-355">
                Roll / Registration Number
              </label>
              <input
                type="text"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. 2023CS1050"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="department" className="block text-xs font-medium text-slate-350">
                Department
              </label>
              <input
                type="text"
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. CSE"
              />
            </div>

            <div>
              <label htmlFor="cgpa" className="block text-xs font-medium text-slate-350">
                Cumulative CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                id="cgpa"
                value={cgpa}
                onChange={(e) => setCgpa(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="graduationBatch" className="block text-xs font-medium text-slate-350">
                Graduation Batch Year
              </label>
              <input
                type="number"
                id="graduationBatch"
                value={graduationBatch}
                onChange={(e) => setGraduationBatch(e.target.value !== '' ? Number(e.target.value) : '')}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. 2026"
              />
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-xs font-medium text-slate-350">
              Skills (comma separated)
            </label>
            <input
              type="text"
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="React, Node.js, Java, SQL, Spring Boot"
            />
          </div>

          <div>
            <label htmlFor="resumeUrl" className="block text-xs font-medium text-slate-350">
              Resume Link (Google Drive / Dropbox / PDF url)
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LinkIcon className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="url"
                id="resumeUrl"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="https://drive.google.com/your-resume-link"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-850 gap-3">
            {savedData && savedData.rollNumber !== '' && savedData.department !== '' && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/40 px-3.5 py-1.5 text-2xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-indigo-650 px-4 py-1.5 text-2xs font-semibold text-white shadow-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {savedData && (savedData.rollNumber === '' || savedData.department === '') ? 'Save Profile' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentProfileView;
