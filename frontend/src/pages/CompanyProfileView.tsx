import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Globe, CheckCircle2, Briefcase, Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';

const CompanyProfileView: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Tabs state
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile'>('analytics');
  const [stats, setStats] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/company/profile');
      const profile = response.data;
      setFullName(profile.user.fullName);
      setEmail(profile.user.email);
      setCompanyName(profile.companyName || '');
      setWebsite(profile.website || '');
      setDescription(profile.description || '');
      setIndustry(profile.industry || '');
    } catch (err: any) {
      setError('Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/company/stats');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load company stats", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const payload = {
      user: { fullName },
      companyName,
      website,
      description,
      industry
    };

    try {
      await api.put('/company/profile', payload);
      setMessage('Profile updated successfully!');
      fetchStats(); // reload stats on update
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update company profile.');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-855 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Recruitment Hub</h2>
          <p className="text-2xs text-slate-400">Post campus jobs, filter candidate registrations, and track applications</p>
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
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Company Profile
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-2xs text-rose-400">
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-2xs text-emerald-450">
          <CheckCircle2 className="h-4 w-4 text-emerald-450" />
          <span>{message}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: ANALYTICS OVERVIEW
          ======================================================== */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Metrics Card Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Jobs Posted</span>
                <span className="text-xl font-bold text-white block mt-0.5">{stats.totalJobs}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Active Listings</span>
                <span className="text-xl font-bold text-white block mt-0.5">{stats.activeJobs}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Total Applicants</span>
                <span className="text-xl font-bold text-white block mt-0.5">{stats.totalApplicants}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Shortlisted</span>
                <span className="text-xl font-bold text-indigo-405 block mt-0.5">{stats.shortlisted}</span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="glass p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Hired / Selected</span>
                <span className="text-xl font-bold text-emerald-450 block mt-0.5">{stats.selected}</span>
              </div>
              <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 md:grid-cols-3">
            {/* Radial gauge for Hiring Rate */}
            <div className="glass p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agency Hiring Rate</h3>
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
                    strokeDasharray={`${stats.hiringRate || 0}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-extrabold text-white">{stats.hiringRate || 0}%</span>
                  <span className="text-4xs text-slate-500 block">Hiring</span>
                </div>
              </div>
              <p className="text-3xs text-slate-500 leading-snug">Hiring rate indicates selected candidates relative to total applications</p>
            </div>

            {/* Selection metrics checklist */}
            <div className="glass p-4 rounded-xl border border-slate-800 space-y-3 md:col-span-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Candidate Audits</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-2xs">
                  <span className="text-slate-400">Total Selection Actions</span>
                  <span className="font-bold text-emerald-450">{stats.selected} candidates</span>
                </div>
                <div className="flex items-center justify-between text-2xs">
                  <span className="text-slate-400">Shortlisted for Review</span>
                  <span className="font-bold text-indigo-400">{stats.shortlisted} candidates</span>
                </div>
                <div className="flex items-center justify-between text-2xs">
                  <span className="text-slate-400">Applications Dismissed</span>
                  <span className="font-bold text-rose-455">{stats.rejected} candidates</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: COMPANY PROFILE EDIT FORM
          ======================================================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="glass p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center border-b border-slate-850 pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-900/60 text-indigo-300 font-bold border border-indigo-500/30 text-xl bg-gradient-to-br from-indigo-700 to-indigo-900 shadow">
              {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">{companyName || 'Configure Company'}</h3>
              <p className="text-2xs text-slate-400 mt-1">{email} (Contact Person: {fullName})</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="companyName" className="block text-xs font-medium text-slate-350">
                Company Legal Name
              </label>
              <input
                type="text"
                id="companyName"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-slate-350">
                Primary HR/Contact Full Name
              </label>
              <input
                type="text"
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="website" className="block text-xs font-medium text-slate-350">
                Company Website URL
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Globe className="h-4 w-4 text-slate-505" />
                </div>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="industry" className="block text-xs font-medium text-slate-350">
                Industry Segment
              </label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="e.g. Technology, Finance, Consulting"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-slate-350">
              About Company
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="Tell us about your organization's core business..."
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-850">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-indigo-650 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanyProfileView;
