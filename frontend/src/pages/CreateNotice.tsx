import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ArrowLeft, Send } from 'lucide-react';

const CreateNotice: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/faculty/notices', { title, content });
      navigate('/notices');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post notice.');
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
          <h2 className="text-2xl font-bold text-white">Create Announcement</h2>
          <p className="text-sm text-slate-400">Post a new notice to the public notice board</p>
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
            Notice Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            placeholder="e.g. Placement Drive Registration Deadline Extended"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-300">
            Notice Content
          </label>
          <textarea
            id="content"
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            placeholder="Write the details here..."
          />
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
                Post Notice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotice;
