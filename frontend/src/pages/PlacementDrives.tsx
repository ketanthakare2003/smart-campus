import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Calendar, Award, GraduationCap, Trash2, Edit, Plus, X } from 'lucide-react';

interface Drive {
  id: number;
  name: string;
  description: string;
  date: string;
  eligibleDepartments: string;
  minimumCgpa: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

const PlacementDrives: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDrives = async () => {
    try {
      const response = await api.get('/tpo/drives');
      setDrives(response.data);
    } catch (err: any) {
      setError('Failed to fetch placement drives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) return;
    try {
      await api.delete(`/tpo/drives/${id}`);
      setDrives(drives.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete drive.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPCOMING':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'COMPLETED':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const isTpoOrAdmin = user?.role === 'TPO' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Placement Drives</h2>
          <p className="text-slate-400">Manage and explore campus hiring events and schedules</p>
        </div>
        {isTpoOrAdmin && (
          <button
            onClick={() => navigate('/tpo/drives/new')}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Schedule Drive
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {drives.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-800">
          <Calendar className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No drives scheduled</h3>
          <p className="text-slate-500 mt-1">There are currently no placement drives listed.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drives.map((drive) => (
            <div key={drive.id} className="glass rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-indigo-550/5 transition-all">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(drive.status)}`}>
                    {drive.status}
                  </span>
                  {isTpoOrAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/tpo/drives/edit/${drive.id}`)}
                        className="rounded-lg p-1 text-slate-500 hover:text-indigo-400 hover:bg-indigo-950/20 transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(drive.id)}
                        className="rounded-lg p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400">{drive.name}</h3>
                  <p className="mt-2 text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {drive.description}
                  </p>
                  {drive.description && drive.description.length > 100 && (
                    <button 
                      onClick={() => setSelectedDrive(drive)}
                      className="mt-1 text-xs text-indigo-455 hover:text-indigo-400 font-semibold transition-colors"
                    >
                      Read More
                    </button>
                  )}
                </div>

                <div className="space-y-2 border-t border-slate-850 pt-4 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-400/80" />
                    <span>{new Date(drive.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-indigo-400/80" />
                    <span>Eligible: {drive.eligibleDepartments || 'All Departments'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-indigo-400/80" />
                    <span>Min CGPA: {drive.minimumCgpa ? drive.minimumCgpa.toFixed(2) : 'No criteria'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal & Backdrop Overlay */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex h-full max-h-[500px] w-full max-w-xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-850 p-6 shrink-0 bg-slate-950/20">
              <div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(selectedDrive.status)}`}>
                  {selectedDrive.status}
                </span>
                <h3 className="text-xl font-bold text-white mt-2 leading-tight">{selectedDrive.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedDrive(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-850 text-sm">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-5 w-5 text-indigo-455" />
                  <div>
                    <span className="text-slate-500 text-xs block">Drive Date</span>
                    <span className="font-semibold text-slate-200">
                      {new Date(selectedDrive.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="h-5 w-5 text-indigo-455" />
                  <div>
                    <span className="text-slate-500 text-xs block">Minimum CGPA</span>
                    <span className="font-semibold text-slate-200">
                      {selectedDrive.minimumCgpa ? selectedDrive.minimumCgpa.toFixed(2) : 'No criteria'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Drive Description</h4>
                <p className="text-slate-305 text-sm leading-relaxed whitespace-pre-wrap">{selectedDrive.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Eligible Departments</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDrive.eligibleDepartments ? (
                    selectedDrive.eligibleDepartments.split(',').map((dept, idx) => (
                      <span key={idx} className="bg-indigo-950/30 border border-indigo-900/40 px-2.5 py-1 rounded-full text-xs text-indigo-400 font-semibold">
                        {dept.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-450 italic text-sm">All Departments Eligible</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-850 bg-slate-900/60 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedDrive(null)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-850 hover:text-white transition-all"
              >
                Close
              </button>
              {isTpoOrAdmin && (
                <button
                  onClick={() => {
                    navigate(`/tpo/drives/edit/${selectedDrive.id}`);
                    setSelectedDrive(null);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-650 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-600 transition-all"
                >
                  <Edit className="h-4 w-4" />
                  Edit Drive
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementDrives;
