import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { 
  Plus, Shield, Building, Check, X, Copy, Trash2, 
  Search, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';

interface CodeDetail {
  id: number;
  code: string;
  targetRole: 'FACULTY' | 'TPO' | 'COMPANY';
  used: boolean;
  expiresAt: string;
  createdDate?: string;
  generatedBy: {
    fullName: string;
  };
}

const AdminCodes: React.FC = () => {
  // Codes table data
  const [codes, setCodes] = useState<CodeDetail[]>([]);
  const [targetRole, setTargetRole] = useState<'FACULTY' | 'TPO' | 'COMPANY'>('FACULTY');
  const [expirationHours, setExpirationHours] = useState(24);
  
  // Search, Filter, Sort and Pagination states
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortDir, setSortDir] = useState('desc');
  
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Summaries state
  const [stats, setStats] = useState({ total: 0, active: 0, used: 0, expired: 0 });

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/codes');
      const list = response.data;
      if (Array.isArray(list)) {
        const now = new Date();
        const active = list.filter((c: any) => !c.used && new Date(c.expiresAt) > now).length;
        const used = list.filter((c: any) => c.used).length;
        const expired = list.filter((c: any) => !c.used && new Date(c.expiresAt) <= now).length;
        setStats({ total: list.length, active, used, expired });
      } else if (list && typeof list === 'object' && 'content' in list) {
        const content = list.content || [];
        const now = new Date();
        const active = content.filter((c: any) => !c.used && new Date(c.expiresAt) > now).length;
        const used = content.filter((c: any) => c.used).length;
        const expired = content.filter((c: any) => !c.used && new Date(c.expiresAt) <= now).length;
        setStats({ total: content.length, active, used, expired });
      }
    } catch (err) {
      console.error('Failed to fetch code metrics', err);
    }
  };

  const fetchCodesPaginated = async () => {
    try {
      const response = await api.get('/admin/codes', {
        params: {
          page,
          size,
          search,
          role,
          status,
          sortBy,
          sortDir
        }
      });
      
      const data = response.data;
      if (data && typeof data === 'object' && 'content' in data) {
        // Backend is running the new paginated API
        setCodes(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        // Backend is running the old API (returns List<RegistrationCodeDto>)
        // Implement client-side pagination, sorting, search, and filtering as a graceful fallback
        
        // 1. Filter
        const filtered = data.filter((code: any) => {
          const sLower = search.trim().toLowerCase();
          const matchesSearch = sLower === '' || code.code.toLowerCase().includes(sLower);
          
          const matchesRole = role === 'ALL' || code.targetRole === role;
          
          let matchesStatus = true;
          const isExpired = new Date(code.expiresAt) < new Date();
          if (status === 'ACTIVE') {
            matchesStatus = !code.used && !isExpired;
          } else if (status === 'USED') {
            matchesStatus = code.used;
          } else if (status === 'EXPIRED') {
            matchesStatus = !code.used && isExpired;
          }
          
          return matchesSearch && matchesRole && matchesStatus;
        });
        
        // 2. Sort
        filtered.sort((a: any, b: any) => {
          let comparison = 0;
          if (sortBy === 'targetRole') {
            comparison = a.targetRole.localeCompare(b.targetRole);
          } else if (sortBy === 'expiresAt') {
            comparison = new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
          } else if (sortBy === 'status') {
            const aActive = !a.used && new Date(a.expiresAt) > new Date();
            const bActive = !b.used && new Date(b.expiresAt) > new Date();
            comparison = (aActive ? 1 : 0) - (bActive ? 1 : 0);
          } else {
            // createdDate or ID
            const valA = a.createdDate || a.id || '';
            const valB = b.createdDate || b.id || '';
            comparison = valA > valB ? 1 : -1;
          }
          return sortDir === 'desc' ? -comparison : comparison;
        });
        
        // 3. Paginate
        setTotalElements(filtered.length);
        setTotalPages(Math.ceil(filtered.length / size));
        
        const start = page * size;
        const end = start + size;
        setCodes(filtered.slice(start, end));
      } else {
        setCodes([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError('Failed to fetch generated registration codes.');
      setCodes([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCodesPaginated();
  }, [page, search, role, status, sortBy, sortDir]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setGenerating(true);

    try {
      await api.post('/admin/codes', {
        targetRole,
        expirationHours
      });
      showToast(`Key generated successfully!`, 'success');
      setExpirationHours(24);
      setPage(0);
      fetchCodesPaginated();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate code.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    showToast(`Copied registration code: ${codeText}`, 'success');
  };

  const handleRevoke = async (id: number, codeText: string) => {
    if (!window.confirm(`Are you sure you want to revoke registration code: ${codeText}? This will immediately de-authorize this key.`)) {
      return;
    }
    try {
      await api.put(`/admin/codes/${id}/revoke`);
      showToast(`Revoked code: ${codeText}`, 'success');
      fetchCodesPaginated();
      fetchStats();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to revoke code.', 'error');
    }
  };

  const handleSort = (field: string) => {
    let dir = 'asc';
    if (sortBy === field) {
      dir = sortDir === 'asc' ? 'desc' : 'asc';
    }
    setSortBy(field);
    setSortDir(dir);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const startRecord = totalElements === 0 ? 0 : page * size + 1;
  const endRecord = Math.min((page + 1) * size, totalElements);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-2xl border text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-455'
        }`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Registration Codes</h2>
          <p className="text-slate-400">Generate single-use verification keys to permit TPO, Faculty, or Company account setups</p>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="glass p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Total Keys</span>
            <span className="text-xl font-bold text-white block mt-1">{stats.total}</span>
          </div>
        </div>
        <div className="glass p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Active Keys</span>
            <span className="text-xl font-bold text-emerald-450 block mt-1">{stats.active}</span>
          </div>
        </div>
        <div className="glass p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Used Keys</span>
            <span className="text-xl font-bold text-rose-455 block mt-1">{stats.used}</span>
          </div>
        </div>
        <div className="glass p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">Expired Keys</span>
            <span className="text-xl font-bold text-slate-400 block mt-1">{stats.expired}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-450 font-semibold">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Code Generator Form (Exactly as it is) */}
        <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4 h-fit">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-400" />
            Generate New Key
          </h3>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="targetRole" className="block text-sm font-medium text-slate-350">
                Target Role
              </label>
              <select
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="FACULTY" className="bg-slate-900">Faculty</option>
                <option value="TPO" className="bg-slate-900">TPO</option>
                <option value="COMPANY" className="bg-slate-900">Company</option>
              </select>
            </div>

            <div>
              <label htmlFor="expirationHours" className="block text-sm font-medium text-slate-350">
                Expiration Duration (Hours)
              </label>
              <input
                type="number"
                id="expirationHours"
                required
                min="1"
                max="720"
                value={expirationHours}
                onChange={(e) => setExpirationHours(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors animate-in"
            >
              {generating ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Generate Key'
              )}
            </button>
          </form>
        </div>

        {/* Scalable, Filterable & Searchable Grid Table */}
        <div className="lg:col-span-2 glass rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          
          {/* Search and Filters Header */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 bg-slate-900/30 border-b border-slate-850 select-none">
            <div className="relative w-full md:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(0);
                }}
                className="rounded-lg border border-slate-700 bg-slate-900/60 py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Roles</option>
                <option value="FACULTY">Faculty</option>
                <option value="TPO">TPO</option>
                <option value="COMPANY">Company</option>
              </select>
              
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                className="rounded-lg border border-slate-700 bg-slate-900/60 py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="USED">Used</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          {/* Table Container (Fixed Height + scrollable) */}
          <div className="overflow-x-auto max-h-[385px] overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse table-fixed min-w-[500px]">
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col className="w-[10%]" />
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
                  <th className="px-6 py-4">Verification Code</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-900/60" onClick={() => handleSort('targetRole')}>
                    <div className="flex items-center gap-1.5">
                      Role Path <ArrowUpDown className="h-3 w-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-900/60" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      State <ArrowUpDown className="h-3 w-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-900/60" onClick={() => handleSort('expiresAt')}>
                    <div className="flex items-center gap-1.5">
                      Expires At <ArrowUpDown className="h-3 w-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500 text-xs italic">
                      No matching registration codes found.
                    </td>
                  </tr>
                ) : (
                  codes.map((code) => {
                    const isExpired = new Date(code.expiresAt) < new Date();
                    const isActive = !code.used && !isExpired;
                    return (
                      <tr key={code.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white tracking-wider truncate">
                          {code.code}
                        </td>
                        <td className="px-6 py-4 truncate">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-850 px-2 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
                            {code.targetRole === 'COMPANY' ? (
                              <Building className="h-3 w-3 text-indigo-400" />
                            ) : (
                              <Shield className="h-3 w-3 text-indigo-400" />
                            )}
                            {code.targetRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 truncate">
                          {code.used ? (
                            <span className="inline-flex items-center gap-1 text-xs text-rose-455 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              <X className="h-3 w-3" /> Used
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-450 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono truncate">
                          {new Date(code.expiresAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleCopy(code.code)}
                              className="rounded p-1 text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                              title="Copy Code"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            {isActive ? (
                              <button
                                onClick={() => handleRevoke(code.id, code.code)}
                                className="rounded p-1 text-slate-500 hover:text-rose-455 hover:bg-rose-950/20 transition-all"
                                title="Revoke Key"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="p-1 opacity-0 pointer-events-none">
                                <Trash2 className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-850 bg-slate-900/40 p-4 gap-3 select-none">
            <span className="text-3xs text-slate-500">
              Showing {startRecord}–{endRecord} of {totalElements} Registration Codes
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded p-1 text-slate-450 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              
              {totalPages > 0 && Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-2.5 py-1 text-3xs font-semibold rounded transition-all ${
                    page === i 
                      ? 'bg-indigo-650 text-white shadow-md' 
                      : 'text-slate-450 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1 || totalPages === 0}
                className="rounded p-1 text-slate-450 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCodes;
