import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { FileText, Calendar, Building, MapPin, Award, ExternalLink } from 'lucide-react';

interface Application {
  id: number;
  job: {
    title: string;
    salaryPackage: string;
    location: string;
    company: {
      companyName: string;
    };
  };
  status: 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
  appliedDate: string;
  resumeUrl: string;
}

const StudentApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      const response = await api.get('/student/applications');
      setApplications(response.data);
    } catch (err: any) {
      setError('Failed to fetch job applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
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
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">My Applications</h2>
        <p className="text-slate-400">Track the review status of your job applications</p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-800">
          <FileText className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No applications yet</h3>
          <p className="text-slate-500 mt-1">Submit your profile to jobs on the Jobs Board to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <div key={app.id} className="glass rounded-2xl border border-slate-800/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700/60 transition-colors">
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">{app.job.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-400 font-semibold text-sm">
                    <Building className="h-4 w-4" />
                    <span>{app.job.company.companyName}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-350">
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-indigo-400/80" />
                    <span>{app.job.salaryPackage}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400/80" />
                    <span>{app.job.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-slate-850 pt-4 md:border-t-0 md:pt-0">
                {app.resumeUrl && (
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    View Resume
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                )}
                
                <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wider ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
