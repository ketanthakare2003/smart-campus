import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Briefcase, Award, MapPin, Building, Calendar, Search, ArrowRight, ExternalLink, ShieldAlert, X, Bookmark } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salaryPackage: string;
  location: string;
  company: {
    companyName: string;
    website: string;
  };
  createdDate: string;
  minimumCgpa: number;
  eligibleDepartments: string;
  eligibleBatches: string;
  requiredSkills: string;
  eligible: boolean;
  eligibilityReasons: string[];
}

const StudentJobsBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  
  // Modal & Save states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<{[key: number]: boolean}>({});

  const fetchJobs = async () => {
    try {
      const response = await api.get('/student/jobs');
      setJobs(response.data);
    } catch (err: any) {
      setError('Failed to fetch jobs listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId: number) => {
    setError('');
    setApplySuccess(null);
    setApplyingJobId(jobId);

    try {
      await api.post(`/student/jobs/${jobId}/apply`);
      setApplySuccess('Successfully applied! Check your applications page to track progress.');
      setTimeout(() => {
        setApplySuccess(null);
      }, 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Apply failed. Ensure you have a resume link saved in your profile.';
      setError(msg);
    } finally {
      setApplyingJobId(null);
    }
  };

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Jobs Board</h2>
        <p className="text-slate-400">View and apply to active recruitment opportunities</p>
      </div>

      <div className="flex items-center gap-4 glass px-4 py-2 rounded-xl border border-slate-800 max-w-md">
        <Search className="h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search jobs, companies or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-0 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 py-2"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {applySuccess && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          {applySuccess}
        </div>
      )}

      {filteredJobs.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-800">
          <Briefcase className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No jobs match your search</h3>
          <p className="text-slate-500 mt-1">Please try modifying your keywords or check back later.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <div key={job.id} className="glass rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{job.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-indigo-400">
                      <Building className="h-4 w-4" />
                      <span className="font-semibold text-sm">{job.company.companyName}</span>
                      {job.company.website && (
                        <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-350 ml-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Eligibility Badge */}
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 ${
                    job.eligible 
                      ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                  }`}>
                    {job.eligible ? 'Eligible' : 'Not Eligible'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-355">
                  <div className="flex items-center gap-1 bg-slate-850 px-2.5 py-1 rounded-full border border-slate-800">
                    <Award className="h-3.5 w-3.5 text-indigo-400/80" />
                    <span>{job.salaryPackage}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-850 px-2.5 py-1 rounded-full border border-slate-800">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400/80" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  {/* Truncated description */}
                  <p className="line-clamp-3 leading-relaxed text-slate-400 text-sm">
                    {job.description}
                  </p>
                  
                  {job.description.length > 150 && (
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none block mt-1"
                    >
                      Read More & View Details
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-850 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  Posted {new Date(job.createdDate).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    className="p-2 rounded-lg border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
                    title="Save Job"
                  >
                    <Bookmark className={`h-4 w-4 ${savedJobs[job.id] ? 'fill-indigo-400 text-indigo-400 border-indigo-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingJobId === job.id || !job.eligible}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-650 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-600 disabled:opacity-40 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {applyingJobId === job.id ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent"></div>
                    ) : (
                      <>
                        Apply
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Premium Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-opacity duration-300">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col glass animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-450 hover:text-white hover:bg-slate-850 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-850 space-y-4 pr-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  selectedJob.eligible 
                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                }`}>
                  {selectedJob.eligible ? '✓ Eligible' : '✕ Not Eligible'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Posted {new Date(selectedJob.createdDate).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">{selectedJob.title}</h3>
                <div className="flex items-center gap-2 mt-1.5 text-indigo-400 text-sm font-semibold">
                  <Building className="h-4 w-4" />
                  <span>{selectedJob.company.companyName}</span>
                  {selectedJob.company.website && (
                    <a href={selectedJob.company.website} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Quick Details Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-850 text-sm">
                <div className="flex items-center gap-2.5">
                  <Award className="h-5 w-5 text-indigo-450" />
                  <div>
                    <span className="text-slate-500 text-xs block">Salary Package</span>
                    <span className="font-semibold text-slate-200">{selectedJob.salaryPackage}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-5 w-5 text-indigo-455" />
                  <div>
                    <span className="text-slate-500 text-xs block">Location</span>
                    <span className="font-semibold text-slate-200">{selectedJob.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job Description</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                </div>
              )}

              {/* Eligibility Checklist */}
              <div className="border-t border-slate-850 pt-5 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Academic Eligibility Checklist</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs bg-slate-950/20 p-4 rounded-xl border border-slate-850">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Min CGPA Required</span>
                    <span className="font-semibold text-slate-200">{selectedJob.minimumCgpa > 0.0 ? selectedJob.minimumCgpa.toFixed(2) : 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Eligible Batches</span>
                    <span className="font-semibold text-slate-200">{selectedJob.eligibleBatches || 'All Batches'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Eligible Departments</span>
                    <span className="font-semibold text-slate-200">{selectedJob.eligibleDepartments || 'All'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Required Skills</span>
                    <span className="font-semibold text-slate-200">{selectedJob.requiredSkills || 'None'}</span>
                  </div>
                </div>

                {/* If Not Eligible: show reason */}
                {!selectedJob.eligible && selectedJob.eligibilityReasons && selectedJob.eligibilityReasons.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs text-rose-400 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-rose-455">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Unmet Eligibility Criteria:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-350">
                      {selectedJob.eligibilityReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-850 bg-slate-900/60 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => toggleSaveJob(selectedJob.id)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-850 hover:text-white transition-all"
              >
                <Bookmark className={`h-4 w-4 ${savedJobs[selectedJob.id] ? 'fill-indigo-400 text-indigo-400 border-indigo-400' : ''}`} />
                {savedJobs[selectedJob.id] ? 'Saved' : 'Save Job'}
              </button>

              <button
                onClick={() => {
                  handleApply(selectedJob.id);
                  setSelectedJob(null);
                }}
                disabled={applyingJobId === selectedJob.id || !selectedJob.eligible}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-650 px-6 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-600 disabled:opacity-40 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all"
              >
                {applyingJobId === selectedJob.id ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent"></div>
                ) : (
                  <>
                    Apply Now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobsBoard;
