import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import { ArrowLeft, Send } from 'lucide-react';

const CreatePlacementDrive: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [eligibleDepartments, setEligibleDepartments] = useState('');
  const [minimumCgpa, setMinimumCgpa] = useState(0.0);
  const [status, setStatus] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode) {
      const fetchDrive = async () => {
        try {
          const response = await api.get(`/tpo/drives/${id}`);
          const drive = response.data;
          setName(drive.name);
          setDescription(drive.description);
          // Convert LocalDateTime format to datetime-local format (YYYY-MM-DDThh:mm)
          const driveDate = new Date(drive.date);
          const formattedDate = driveDate.toISOString().slice(0, 16);
          setDate(formattedDate);
          setEligibleDepartments(drive.eligibleDepartments);
          setMinimumCgpa(drive.minimumCgpa);
          setStatus(drive.status);
        } catch (err: any) {
          setError('Failed to fetch placement drive details.');
        } finally {
          setFetching(false);
        }
      };
      fetchDrive();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      description,
      date: new Date(date).toISOString(),
      eligibleDepartments,
      minimumCgpa: Number(minimumCgpa),
      status
    };

    try {
      if (isEditMode) {
        await api.put(`/tpo/drives/${id}`, payload);
      } else {
        await api.post('/tpo/drives', payload);
      }
      navigate('/drives');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save placement drive.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Placement Drive' : 'Schedule Placement Drive'}</h2>
          <p className="text-sm text-slate-400">Specify details for the campus placement event</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl border border-slate-800 space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">
            Drive Title / Company Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            placeholder="e.g. Google India Recruitment Drive 2026"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">
            Description / Eligibility Details
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            placeholder="e.g. Hiring for SDE roles, package 30LPA..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-300">
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              id="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="minimumCgpa" className="block text-sm font-medium text-slate-300">
              Minimum CGPA Requirement
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              id="minimumCgpa"
              required
              value={minimumCgpa}
              onChange={(e) => setMinimumCgpa(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="eligibleDepartments" className="block text-sm font-medium text-slate-300">
              Eligible Departments
            </label>
            <input
              type="text"
              id="eligibleDepartments"
              value={eligibleDepartments}
              onChange={(e) => setEligibleDepartments(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. CSE, IT, ECE"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300">
              Drive Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="UPCOMING" className="bg-slate-900 text-white">Upcoming</option>
              <option value="ACTIVE" className="bg-slate-900 text-white">Active</option>
              <option value="COMPLETED" className="bg-slate-900 text-white">Completed</option>
              <option value="CANCELLED" className="bg-slate-900 text-white">Cancelled</option>
            </select>
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
                {isEditMode ? 'Save Changes' : 'Schedule Drive'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlacementDrive;
