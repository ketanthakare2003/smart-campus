import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Bell, Trash2, Calendar, User, Plus } from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  content: string;
  postedBy: {
    fullName: string;
    role: string;
  };
  postedDate: string;
}

const NoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotices = async () => {
    try {
      const response = await api.get('/faculty/notices');
      setNotices(response.data);
    } catch (err: any) {
      setError('Failed to fetch notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/faculty/notices/${id}`);
      setNotices(notices.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete notice.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const canPostNotice = user?.role === 'FACULTY' || user?.role === 'TPO' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Notice Board</h2>
          <p className="text-slate-400">Important campus announcements and drives updates</p>
        </div>
        {canPostNotice && (
          <button
            onClick={() => navigate('/faculty/notices/new')}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post Notice
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {notices.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-800">
          <Bell className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No announcements yet</h3>
          <p className="text-slate-500 mt-1">Check back later for campus notices.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {notices.map((notice) => (
            <div key={notice.id} className="glass p-6 rounded-2xl border border-slate-800/60 relative hover:border-slate-700/80 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-lg font-semibold text-indigo-300">{notice.title}</h3>
                  {user && (user.role === 'ADMIN' || (user.role === 'FACULTY')) && (
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="rounded-lg p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-400/80" />
                  <span>{notice.postedBy.fullName} ({notice.postedBy.role})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400/80" />
                  <span>{new Date(notice.postedDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
