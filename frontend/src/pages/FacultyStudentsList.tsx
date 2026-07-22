import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Mail, GraduationCap, Edit2, Check, X, FileText, Activity, Users, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Student {
  id: number;
  rollNumber: string;
  department: string;
  cgpa: number;
  skills: string;
  resumeUrl: string;
  user: {
    fullName: string;
    email: string;
  };
}

const FacultyStudentsList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [newCgpa, setNewCgpa] = useState<number>(0.0);
  const [error, setError] = useState('');

  // Tabs state
  const [activeTab, setActiveTab] = useState<'analytics' | 'directory'>('analytics');
  const [stats, setStats] = useState<any>(null);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/faculty/students');
      setStudents(response.data);
    } catch (err: any) {
      setError('Failed to fetch students list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/faculty/stats');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load faculty stats", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  const handleEditClick = (student: Student) => {
    setEditingStudentId(student.id);
    setNewCgpa(student.cgpa || 0.0);
  };

  const handleSaveCgpa = async (id: number) => {
    if (newCgpa < 0 || newCgpa > 10) {
      alert('CGPA must be between 0 and 10');
      return;
    }

    try {
      const response = await api.put(`/faculty/students/${id}/cgpa?cgpa=${newCgpa}`);
      setStudents(students.map((st) => (st.id === id ? response.data : st)));
      setEditingStudentId(null);
      fetchStats(); // reload stats on CGPA updates
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update CGPA.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-855 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Faculty Administration</h2>
          <p className="text-2xs text-slate-400">Verify student registrations, update credentials, and review academic statistics</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              activeTab === 'directory'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Students Directory
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-2xs text-rose-400">
          {error}
        </div>
      )}

      {/* ========================================================
          TAB 1: ANALYTICS OVERVIEW
          ======================================================== */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Faculty Dashboard Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Total Registered</span>
                <span className="text-xl font-bold text-white block mt-0.5">{stats.totalStudents}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Verified Students</span>
                <span className="text-xl font-bold text-emerald-450 block mt-0.5">{stats.verifiedStudents}</span>
              </div>
              <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Pending Verification</span>
                <span className="text-xl font-bold text-amber-450 block mt-0.5">{stats.pendingVerification}</span>
              </div>
              <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Department breakdown chart */}
          <div className="glass p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-850 pb-1.5">
              <Activity className="h-4 w-4 text-indigo-400" />
              Students by Department
            </h3>
            
            <div className="space-y-3 max-w-2xl">
              {stats.studentsByDept && Object.entries(stats.studentsByDept).length > 0 ? (
                Object.entries(stats.studentsByDept).map(([dept, count]: any) => {
                  const total = Object.values(stats.studentsByDept).reduce((a: any, b: any) => a + b, 0) as number;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-3xs font-semibold">
                        <span className="text-slate-350">{dept}</span>
                        <span className="text-slate-500">{count} students ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-850">
                        <div 
                          className="bg-indigo-500 h-1 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">No student department records registered.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: DIRECTORY LIST
          ======================================================== */}
      {activeTab === 'directory' && (
        students.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl border border-slate-800">
            <GraduationCap className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-350">No students found</h3>
            <p className="text-slate-500 mt-1">There are currently no students registered in the system.</p>
          </div>
        ) : (
          <div className="glass rounded-xl border border-slate-800 overflow-hidden animate-in fade-in duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-3xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Student Info</th>
                    <th className="px-5 py-3">Roll Number</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">CGPA</th>
                    <th className="px-5 py-3">Skills</th>
                    <th className="px-5 py-3">Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-2xs text-slate-300">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-white">{st.user.fullName}</div>
                        <div className="text-4xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {st.user.email}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-400">
                        {st.rollNumber || 'Not configured'}
                      </td>
                      <td className="px-5 py-3 text-slate-450 font-bold">
                        {st.department || 'Not configured'}
                      </td>
                      <td className="px-5 py-3">
                        {editingStudentId === st.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="10"
                              value={newCgpa}
                              onChange={(e) => setNewCgpa(Number(e.target.value))}
                              className="w-14 rounded bg-slate-900 border border-slate-700 py-0.5 px-1 text-3xs text-white"
                            />
                            <button
                              onClick={() => handleSaveCgpa(st.id)}
                              className="rounded p-0.5 bg-emerald-500/20 text-emerald-450 hover:bg-emerald-500/30 transition-colors"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="rounded p-0.5 bg-rose-500/20 text-rose-455 hover:bg-rose-500/30 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-200">{st.cgpa ? st.cgpa.toFixed(2) : '0.00'}</span>
                            <button
                              onClick={() => handleEditClick(st)}
                              className="p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-indigo-400 transition-colors"
                              title="Edit CGPA"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {st.skills ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {st.skills.split(',').slice(0, 3).map((s, idx) => (
                              <span key={idx} className="bg-slate-850 border border-slate-800 px-1 rounded-full text-4xs text-slate-400">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="italic text-slate-600">None</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {st.resumeUrl ? (
                          <a
                            href={st.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-indigo-650 px-2 py-1 text-4xs font-semibold text-white shadow hover:bg-indigo-600 transition-all"
                          >
                            <FileText className="h-3 w-3" />
                            View
                          </a>
                        ) : (
                          <span className="text-4xs text-rose-455 italic font-semibold">Missing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default FacultyStudentsList;
