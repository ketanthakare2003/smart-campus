import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { ShieldCheck, Check, X, Shield, Building } from 'lucide-react';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'FACULTY' | 'TPO' | 'COMPANY';
  status: 'PENDING_VERIFICATION' | 'PENDING_ADMIN_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
}

const AdminApprovals: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      // Filter for users in PENDING_ADMIN_APPROVAL state
      const pending = response.data.filter(
        (u: User) => u.status === 'PENDING_ADMIN_APPROVAL'
      );
      setUsers(pending);
    } catch (err: any) {
      setError('Failed to fetch pending users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'ACTIVE' | 'REJECTED') => {
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/users/${id}/status?status=${status}`);
      setUsers(users.filter((u) => u.id !== id));
      setMessage(`Successfully ${status === 'ACTIVE' ? 'approved' : 'rejected'} account.`);
      setTimeout(() => setMessage(''), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status.');
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
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Profile Approval Directory</h2>
        <p className="text-slate-400">Review onboarding requests from Faculty, TPOs, and Companies and approve access</p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-450">
          {message}
        </div>
      )}

      {users.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-800">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No pending approvals</h3>
          <p className="text-slate-500 mt-1">There are currently no Faculty, TPO, or Company registrations awaiting approval.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Requested Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {u.fullName}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-350 border border-slate-700">
                        {u.role === 'COMPANY' ? (
                          <Building className="h-3 w-3 text-indigo-400" />
                        ) : (
                          <Shield className="h-3 w-3 text-indigo-400" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-950/20"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(u.id, 'REJECTED')}
                          className="flex items-center gap-1.5 rounded-lg bg-rose-950/20 border border-rose-500/20 px-3.5 py-1.5 text-xs font-semibold text-rose-455 hover:bg-rose-900/30 transition-all"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
