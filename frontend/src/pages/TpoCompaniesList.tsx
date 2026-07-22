import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Building, Globe, Mail, Trash2, ExternalLink, Calendar, Users, ShieldCheck, Activity, Clock } from 'lucide-react';

interface Company {
  id: number;
  companyName: string;
  website: string;
  description: string;
  industry: string;
  user: {
    fullName: string;
    email: string;
  };
}

const TpoCompaniesList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tabs state
  const [activeTab, setActiveTab] = useState<'analytics' | 'companies' | 'timeline'>('analytics');
  const [stats, setStats] = useState<any>(null);

  // Timeline Activity Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [logPage, setLogPage] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(0);
  const [logCategory, setLogCategory] = useState('ALL');

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/tpo/companies');
      setCompanies(response.data);
    } catch (err: any) {
      setError('Failed to fetch companies list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tpo/stats');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load TPO stats", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/activity-logs?page=${logPage}&size=10&category=${logCategory}`);
      setLogs(response.data.content);
      setLogTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Failed to load logs", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'timeline') {
      fetchLogs();
    }
  }, [activeTab, logPage, logCategory]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this company? All associated job listings will be removed.')) return;
    try {
      await api.delete(`/tpo/companies/${id}`);
      setCompanies(companies.filter((c) => c.id !== id));
      fetchStats(); // reload stats on deletion
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete company profile.');
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
          <h2 className="text-xl font-bold tracking-tight text-white">TPO Dashboard</h2>
          <p className="text-2xs text-slate-400">Moderate corporate entities, publish placement drives, and inspect campus hiring statistics</p>
        </div>

        {/* Tab Controls */}
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
            onClick={() => setActiveTab('companies')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              activeTab === 'companies'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Companies List
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Timeline
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
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Active Drives</span>
                <span className="text-xl font-bold text-white block mt-0.5">{stats.activeDrives}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Calendar className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Registered Companies</span>
                <span className="text-xl font-bold text-white block mt-0.5">{stats.companies}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Building className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Total Registrations</span>
                <span className="text-xl font-bold text-white block mt-0.5">{stats.totalRegistrations}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Students Eligible</span>
                <span className="text-xl font-bold text-emerald-450 block mt-0.5">{stats.studentsEligible}</span>
              </div>
              <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Hiring radial dial */}
          <div className="glass p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2 max-w-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campus Selection Rate</h3>
            <div className="relative h-24 w-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-850"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500"
                  strokeDasharray={`${stats.placementRate || 0}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-extrabold text-white">{stats.placementRate || 0}%</span>
                <span className="text-4xs text-slate-500 block">Placed</span>
              </div>
            </div>
            <p className="text-3xs text-slate-500 leading-snug">Calculated out of total registered students placed successfully in companies</p>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: COMPANIES LIST
          ======================================================== */}
      {activeTab === 'companies' && (
        companies.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl border border-slate-800 animate-in fade-in duration-200">
            <Building className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-350">No companies registered</h3>
            <p className="text-slate-500 mt-1">There are currently no corporate profiles registered.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-200">
            {companies.map((company) => (
              <div key={company.id} className="glass rounded-xl border border-slate-805 p-4 flex flex-col justify-between hover:border-slate-700/60 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{company.companyName}</h3>
                      <span className="text-4xs font-semibold text-indigo-400 block mt-0.5">{company.industry || 'General Industry'}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="rounded p-1 text-slate-500 hover:text-rose-455 hover:bg-rose-955/20 transition-all shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-2xs text-slate-350 line-clamp-3 leading-relaxed">
                    {company.description || 'No description provided.'}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-850 pt-3 text-3xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="truncate">Contact: {company.user.fullName} ({company.user.email})</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-indigo-400" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-0.5">
                          Visit Website
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ========================================================
          TAB 3: SYSTEM TIMELINE
          ======================================================== */}
      {activeTab === 'timeline' && (
        <div className="glass p-4 rounded-xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
          
          {/* Timeline Controls */}
          <div className="flex items-center justify-between border-b border-slate-855 pb-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-400" />
              Event Timeline Log
            </h3>
            
            <div className="flex items-center gap-2">
              <label htmlFor="logCategory" className="text-3xs text-slate-500 uppercase font-semibold">Category</label>
              <select
                id="logCategory"
                value={logCategory}
                onChange={(e) => {
                  setLogCategory(e.target.value);
                  setLogPage(0);
                }}
                className="rounded bg-slate-900 border border-slate-800 py-1 px-2 text-3xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Events</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="SECURITY">Security</option>
                <option value="PLACEMENT">Placement</option>
                <option value="NOTICE">Notices</option>
              </select>
            </div>
          </div>

          {/* Activity Logs Timeline list */}
          <div className="relative pl-6 border-l border-slate-850 space-y-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="relative">
                  {/* Outer circle dot */}
                  <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border border-slate-950 bg-indigo-650 flex items-center justify-center shadow">
                    <Activity className="h-2 w-2 text-white" />
                  </span>
                  
                  <div className="glass p-2.5 rounded-lg border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-2 max-w-4xl hover:border-slate-800/80 transition-all">
                    <div>
                      <span className={`text-4xs font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                        log.category === 'SECURITY' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' :
                        log.category === 'PLACEMENT' ? 'bg-indigo-500/10 text-indigo-455 border border-indigo-500/20' :
                        'bg-slate-850 text-slate-400 border border-slate-800'
                      }`}>
                        {log.category}
                      </span>
                      <h4 className="text-2xs font-bold text-white mt-1">{log.action}</h4>
                      <p className="text-3xs text-slate-400 mt-0.5">{log.details}</p>
                    </div>

                    <div className="text-right whitespace-nowrap text-3xs text-slate-500 self-end md:self-center">
                      <span className="font-semibold text-slate-450 block">{log.user ? log.user.fullName : 'System Engine'}</span>
                      <span>{new Date(log.createdDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-slate-500 italic py-6">
                No logs found for this filter.
              </div>
            )}
          </div>

          {/* Pagination buttons */}
          {logTotalPages > 1 && (
            <div className="flex justify-end gap-2 border-t border-slate-855 pt-3">
              <button
                disabled={logPage === 0}
                onClick={() => setLogPage(logPage - 1)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-3xs text-slate-350 hover:text-white disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={logPage >= logTotalPages - 1}
                onClick={() => setLogPage(logPage + 1)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-3xs text-slate-350 hover:text-white disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default TpoCompaniesList;
