import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Briefcase, Award, MapPin, Calendar, Plus, ToggleLeft, ToggleRight, Users } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salaryPackage: string;
  location: string;
  status: 'OPEN' | 'CLOSED';
  createdDate: string;
  eligibleStudentsCount: number;
}

const CompanyJobsList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const response = await api.get('/company/jobs');
      setJobs(response.data);
    } catch (err: any) {
      setError('Failed to fetch your jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: 'OPEN' | 'CLOSED') => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const response = await api.put(`/company/jobs/${id}/status?status=${newStatus}`);
      setJobs(jobs.map((job) => (job.id === id ? response.data : job)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update job status.');
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">My Job Listings</h2>
          <p className="text-slate-400">View and toggle recruitment state for your active openings</p>
        </div>
        <button
          onClick={() => navigate('/company/jobs/new')}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Job Listing
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-800">
          <Briefcase className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No jobs posted yet</h3>
          <p className="text-slate-500 mt-1">Start hiring by creating your first job listing today.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="glass rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-white leading-tight">{job.title}</h3>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    job.status === 'OPEN'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-350">
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-indigo-400/80" />
                    <span>{job.salaryPackage}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400/80" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Posted {new Date(job.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Eligible Students Tracker Badge */}
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit text-xs font-semibold">
                  <Users className="h-3.5 w-3.5" />
                  <span>{job.eligibleStudentsCount} Eligible Students</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {job.description}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-850 pt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleToggleStatus(job.id, job.status)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                >
                  {job.status === 'OPEN' ? (
                    <>
                      <ToggleRight className="h-4.5 w-4.5 text-emerald-500" />
                      Close Listing
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4.5 w-4.5 text-slate-500" />
                      Reopen Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyJobsList;
