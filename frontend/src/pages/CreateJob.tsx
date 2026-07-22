import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ArrowLeft, Send } from 'lucide-react';

const CreateJob: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('');
  const [location, setLocation] = useState('');
  
  // Eligibility criteria inputs
  const [minimumCgpa, setMinimumCgpa] = useState<number | ''>('');
  const [eligibleDepartments, setEligibleDepartments] = useState('');
  const [eligibleBatches, setEligibleBatches] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/company/jobs', {
        title,
        description,
        requirements,
        salaryPackage,
        location,
        minimumCgpa: minimumCgpa !== '' ? Number(minimumCgpa) : 0.0,
        eligibleDepartments,
        eligibleBatches,
        requiredSkills
      });
      navigate('/company/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post job listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Post Job Opportunity</h2>
          <p className="text-sm text-slate-400">Add a new career opening with academic eligibility criteria</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl border border-slate-800 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300">
            Job Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            placeholder="e.g. Software Engineer (Backend)"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">
            Job Description
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            placeholder="Provide summary of the job description..."
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-slate-300">
            Requirements / Qualifications
          </label>
          <textarea
            id="requirements"
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            placeholder="Specify general highlights or eligibility guidelines..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="salaryPackage" className="block text-sm font-medium text-slate-300">
              Salary Package (annual CTC)
            </label>
            <input
              type="text"
              id="salaryPackage"
              required
              value={salaryPackage}
              onChange={(e) => setSalaryPackage(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. 12 LPA"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-300">
              Location
            </label>
            <input
              type="text"
              id="location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. Bangalore / Remote"
            />
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-2">
          <h4 className="text-sm font-bold text-indigo-400 mb-4">🎓 Academic Eligibility Criteria</h4>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="minimumCgpa" className="block text-sm font-medium text-slate-350">
                Minimum CGPA Required
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                id="minimumCgpa"
                value={minimumCgpa}
                onChange={(e) => setMinimumCgpa(e.target.value !== '' ? Number(e.target.value) : '')}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="e.g. 7.50 (Leave 0 or blank for none)"
              />
            </div>

            <div>
              <label htmlFor="eligibleBatches" className="block text-sm font-medium text-slate-350">
                Eligible Graduation Batches (comma separated)
              </label>
              <input
                type="text"
                id="eligibleBatches"
                value={eligibleBatches}
                onChange={(e) => setEligibleBatches(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="e.g. 2025, 2026"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="eligibleDepartments" className="block text-sm font-medium text-slate-355">
              Eligible Departments (comma separated)
            </label>
            <input
              type="text"
              id="eligibleDepartments"
              value={eligibleDepartments}
              onChange={(e) => setEligibleDepartments(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. CSE, IT, ECE"
            />
          </div>

          <div>
            <label htmlFor="requiredSkills" className="block text-sm font-medium text-slate-350">
              Required Core Skills (comma separated)
            </label>
            <input
              type="text"
              id="requiredSkills"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. React, Java, Spring"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Publish Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
