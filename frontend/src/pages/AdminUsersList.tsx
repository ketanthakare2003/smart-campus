import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Shield, Trash2, CheckCircle2, Activity, 
  Clock, Briefcase, FileText, Award, Calendar,
  Eye, MoreVertical, Check, X
} from 'lucide-react';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'FACULTY' | 'TPO' | 'COMPANY';
  status: 'PENDING_VERIFICATION' | 'PENDING_ADMIN_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
}

const AdminUsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user: currentUser } = useAuth();

  // Dropdown & Modal States
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'timeline'>('analytics');

  // Stats State
  const [stats, setStats] = useState<any>(null);

  // Timeline Activity Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [logPage, setLogPage] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(0);
  const [logCategory, setLogCategory] = useState('ALL');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err: any) {
      setError('Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load admin stats", err);
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
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'timeline') {
      fetchLogs();
    }
  }, [activeTab, logPage, logCategory]);


  const handleStatusChange = async (id: number, newStatus: string) => {
    setError('');
    setMessage('');
    try {
      const response = await api.put(`/admin/users/${id}/status?status=${newStatus}`);
      setUsers(users.map((u) => (u.id === id ? response.data : u)));
      setMessage(`Successfully changed user status to ${newStatus}`);
      fetchStats(); // reload stats on status change
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change status.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user account? All profile details will be permanently wiped.')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      setMessage('User account successfully deleted.');
      fetchStats(); // reload stats on deletion
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20';
      case 'SUSPENDED':
        return 'bg-rose-500/10 text-rose-455 border-rose-500/20';
      case 'REJECTED':
        return 'bg-slate-500/15 text-slate-400 border-slate-700/30';
      case 'PENDING_VERIFICATION':
      case 'PENDING_ADMIN_APPROVAL':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Campus Control Center</h2>
          <p className="text-2xs text-slate-400">Audit system events, verify registered users, and audit placement analytics</p>
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
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Users Directory
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
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="glass p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Students</span>
                <span className="text-lg font-bold text-white block">{stats.totalStudents}</span>
              </div>
              <div className="p-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Users className="h-4 w-4" />
              </div>
            </div>

            <div className="glass p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Faculty</span>
                <span className="text-lg font-bold text-white block">{stats.totalFaculty}</span>
              </div>
              <div className="p-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Shield className="h-4 w-4" />
              </div>
            </div>

            <div className="glass p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Companies</span>
                <span className="text-lg font-bold text-white block">{stats.totalCompanies}</span>
              </div>
              <div className="p-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Award className="h-4 w-4" />
              </div>
            </div>

            <div className="glass p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Jobs posted</span>
                <span className="text-lg font-bold text-white block">{stats.totalJobs}</span>
              </div>
              <div className="p-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>

            <div className="glass p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Applications</span>
                <span className="text-lg font-bold text-white block">{stats.totalApplications}</span>
              </div>
              <div className="p-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <FileText className="h-4 w-4" />
              </div>
            </div>

            <div className="glass p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Drives</span>
                <span className="text-lg font-bold text-white block">{stats.totalDrives}</span>
              </div>
              <div className="p-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-indigo-400">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Interactive SVG Chart row */}
          <div className="grid gap-3.5 md:grid-cols-3">
            
            {/* SVG Progress gauge for Placement rate */}
            <div className="glass p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Placement Rate</h3>
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
              <p className="text-3xs text-slate-500 leading-snug">Calculated out of verified students selected in placement drives</p>
            </div>

            {/* Department stats bar list */}
            <div className="glass p-4 rounded-xl border border-slate-800 space-y-3 md:col-span-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-400" />
                Students by Department
              </h3>
              
              <div className="grid gap-2 max-h-36 overflow-y-auto pr-1">
                {stats.studentsByDept && Object.entries(stats.studentsByDept).length > 0 ? (
                  Object.entries(stats.studentsByDept).map(([dept, count]: any) => {
                    const total = Object.values(stats.studentsByDept).reduce((a: any, b: any) => a + b, 0) as number;
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex justify-between text-3xs font-semibold">
                          <span className="text-slate-350">{dept}</span>
                          <span className="text-slate-500">{count} students ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-850">
                          <div 
                            className="bg-indigo-500 h-1 rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic">No student department records registered.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: USER DIRECTORY
          ======================================================== */}
      {activeTab === 'users' && (
        <div className="glass rounded-xl border border-slate-800/80 overflow-hidden animate-in fade-in duration-200 relative min-h-[280px]">
          {activeDropdown !== null && (
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setActiveDropdown(null)}
            />
          )}

          <div className="overflow-x-auto min-h-[280px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-3xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-2xs text-slate-300">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const mockLastUpdated = u.id 
                    ? new Date(1784344000000 - u.id * 1000 * 60 * 60 * 4).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) 
                    : '—';
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-white">
                          {u.fullName} {isSelf && <span className="text-3xs font-normal text-indigo-400">(You)</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-450">
                        {u.email}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-850 px-2 py-0.5 text-3xs font-semibold text-slate-300 border border-slate-800">
                          <Shield className="h-3 w-3 text-indigo-455" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-3xs font-semibold ${getStatusColor(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-450">
                        {mockLastUpdated}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 relative">
                          <button
                            onClick={() => { setSelectedUser(u); setShowDetailsModal(true); }}
                            className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {isSelf ? (
                            <span className="text-3xs text-slate-500 italic px-2 py-1 select-none">No Action (Self)</span>
                          ) : (
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                                className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                                title="More Actions"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                              
                              {activeDropdown === u.id && (
                                <div className="absolute right-0 mt-1 w-52 rounded-lg bg-slate-900 border border-slate-800 shadow-xl z-20 py-1 origin-top-right transition-all animate-in fade-in slide-in-from-top-1 duration-150">
                                  {u.status === 'PENDING_ADMIN_APPROVAL' && (
                                    <>
                                      <button
                                        onClick={() => { handleStatusChange(u.id, 'ACTIVE'); setActiveDropdown(null); }}
                                        className="w-full text-left px-3 py-1.5 text-3xs font-semibold text-emerald-450 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                                      >
                                        <Check className="h-3.5 w-3.5 shrink-0" /> Approve
                                      </button>
                                      <button
                                        onClick={() => { handleStatusChange(u.id, 'REJECTED'); setActiveDropdown(null); }}
                                        className="w-full text-left px-3 py-1.5 text-3xs font-semibold text-rose-455 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                                      >
                                        <X className="h-3.5 w-3.5 shrink-0" /> Reject
                                      </button>
                                    </>
                                  )}
                                  {u.status === 'ACTIVE' && (
                                    <button
                                      onClick={() => { handleStatusChange(u.id, 'SUSPENDED'); setActiveDropdown(null); }}
                                      className="w-full text-left px-3 py-1.5 text-3xs font-semibold text-amber-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                                    >
                                      <X className="h-3.5 w-3.5 shrink-0" /> Suspend
                                    </button>
                                  )}
                                  {u.status === 'SUSPENDED' && (
                                    <button
                                      onClick={() => { handleStatusChange(u.id, 'ACTIVE'); setActiveDropdown(null); }}
                                      className="w-full text-left px-3 py-1.5 text-3xs font-semibold text-indigo-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                                    >
                                      <Check className="h-3.5 w-3.5 shrink-0" /> Activate
                                    </button>
                                  )}
                                  {u.status === 'PENDING_VERIFICATION' && (
                                    <>
                                      <div className="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider select-none border-b border-slate-850 pb-1 mb-1">
                                        Awaiting Faculty Verification
                                      </div>
                                      <button
                                        onClick={() => { handleStatusChange(u.id, 'ACTIVE'); setActiveDropdown(null); }}
                                        className="w-full text-left px-3 py-1.5 text-3xs font-semibold text-emerald-450 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                                      >
                                        <Check className="h-3.5 w-3.5 shrink-0" /> Approve
                                      </button>
                                      <button
                                        onClick={() => { handleStatusChange(u.id, 'REJECTED'); setActiveDropdown(null); }}
                                        className="w-full text-left px-3 py-1.5 text-3xs font-semibold text-rose-455 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                                      >
                                        <X className="h-3.5 w-3.5 shrink-0" /> Reject
                                      </button>
                                    </>
                                  )}
                                  
                                  <div className="border-t border-slate-850 my-1"></div>
                                  
                                  <button
                                    onClick={() => { handleDeleteUser(u.id); setActiveDropdown(null); }}
                                    className="w-full text-left px-3 py-1.5 text-3xs font-semibold text-rose-500 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 shrink-0" /> Delete User
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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

      {/* ========================================================
          USER DETAILS MODAL
          ======================================================== */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass border border-slate-800 p-6 rounded-2xl shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setShowDetailsModal(false); setSelectedUser(null); }}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-500 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-650 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-650/20 select-none">
                {selectedUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedUser.fullName}</h3>
                <span className="text-4xs text-slate-500 font-mono">User ID: #{selectedUser.id}</span>
              </div>
            </div>
            
            <div className="space-y-3.5 border-t border-slate-850 pt-4 text-3xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 uppercase font-bold tracking-wider">Email Address</span>
                <span className="text-slate-355 font-mono select-all">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 uppercase font-bold tracking-wider">Security Role</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-850 px-2 py-0.5 font-semibold text-slate-300 border border-slate-800">
                  <Shield className="h-3 w-3 text-indigo-455" />
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 uppercase font-bold tracking-wider">Status Badge</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold ${getStatusColor(selectedUser.status)}`}>
                  {selectedUser.status}
                </span>
              </div>
              
              {/* Contextual mock profiles */}
              {selectedUser.role === 'STUDENT' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Department</span>
                    <span className="text-slate-300">Computer Science & Engineering</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">CGPA Profile</span>
                    <span className="text-emerald-450 font-bold">8.75 / 10.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Academic Batch</span>
                    <span className="text-slate-300">Class of 2026</span>
                  </div>
                </>
              )}

              {selectedUser.role === 'COMPANY' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Corporate Sector</span>
                    <span className="text-slate-300">Software & Cloud Services</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Website Portal</span>
                    <span className="text-indigo-400 underline font-mono cursor-pointer">corporate.com</span>
                  </div>
                </>
              )}

              {selectedUser.role === 'FACULTY' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Department Assigned</span>
                    <span className="text-slate-300">Information Technology</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Designation</span>
                    <span className="text-slate-300">Senior Faculty Mentor</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="border-t border-slate-850 pt-4 flex justify-end">
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedUser(null); }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsersList;
