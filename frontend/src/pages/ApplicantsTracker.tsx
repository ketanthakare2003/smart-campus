import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { User, FileText, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

interface Applicant {
  id: number;
  job: {
    title: string;
  };
  student: {
    rollNumber: string;
    department: string;
    cgpa: number;
    skills: string;
    resumeUrl: string;
    user: {
      fullName: string;
      email: string;
    };
  };
  status: 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
  appliedDate: string;
  resumeUrl: string;
}

const ApplicantsTracker: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplicants = async () => {
    try {
      const response = await api.get('/company/applicants');
      setApplicants(response.data);
    } catch (err: any) {
      setError('Failed to fetch job applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleUpdateStatus = async (applicationId: number, status: 'SHORTLISTED' | 'SELECTED' | 'REJECTED') => {
    try {
      const response = await api.put(`/company/applicants/${applicationId}/status?status=${status}`);
      setApplicants(applicants.map((app) => (app.id === applicationId ? response.data : app)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update applicant status.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SHORTLISTED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'APPLIED':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Applicants Tracker</h2>
        <p className="text-slate-400">Review student job applications and manage recruitment stages</p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {applicants.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-800">
          <User className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No applicants yet</h3>
          <p className="text-slate-500 mt-1">When students apply to your job listings, they will show up here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applicants.map((app) => (
            <div key={app.id} className="glass rounded-2xl border border-slate-800/80 p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6 hover:border-slate-700/60 transition-colors">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                    Job: {app.job.title}
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{app.student.user.fullName}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{app.student.user.email}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-300">
                  <div>
                    <span className="text-slate-550 block text-xs">Roll Number</span>
                    <span className="font-semibold">{app.student.rollNumber || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 block text-xs">Department</span>
                    <span className="font-semibold">{app.student.department || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 block text-xs">CGPA</span>
                    <span className="font-semibold text-emerald-400">{app.student.cgpa ? app.student.cgpa.toFixed(2) : 'N/A'}</span>
                  </div>
                </div>

                {app.student.skills && (
                  <div>
                    <span className="text-slate-550 text-xs">Skills</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {app.student.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="bg-slate-850 border border-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 border-t border-slate-850 pt-4 lg:border-t-0 lg:pt-0">
                {app.resumeUrl && (
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-indigo-400" />
                    Review Resume
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                )}

                {app.status === 'APPLIED' && (
                  <div className="flex gap-2 w-full justify-end">
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                      className="flex items-center justify-center gap-1 rounded-lg bg-indigo-650/80 px-3.5 py-2.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-600 transition-all"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                      className="flex items-center justify-center gap-1 rounded-lg bg-rose-950/20 border border-rose-500/20 px-3.5 py-2.5 text-xs font-semibold text-rose-455 hover:bg-rose-900/30 transition-all"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                )}

                {app.status === 'SHORTLISTED' && (
                  <div className="flex gap-2 w-full justify-end">
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                      className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600/90 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Select
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                      className="flex items-center justify-center gap-1 rounded-lg bg-rose-950/20 border border-rose-500/20 px-3.5 py-2.5 text-xs font-semibold text-rose-455 hover:bg-rose-900/30 transition-all"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantsTracker;
