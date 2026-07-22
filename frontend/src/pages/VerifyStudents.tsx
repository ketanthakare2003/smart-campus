import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { ShieldCheck, Mail, Check, X, FileText } from 'lucide-react';

interface Student {
  id: number;
  rollNumber: string;
  department: string;
  cgpa: number;
  skills: string;
  resumeUrl: string;
  user: {
    fullName: string;
    email: string;
    status: string;
  };
}

const VerifyStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPendingStudents = async () => {
    try {
      const response = await api.get('/faculty/students/pending');
      setStudents(response.data);
    } catch (err: any) {
      setError('Failed to fetch pending students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const handleVerify = async (id: number, action: 'APPROVE' | 'REJECT') => {
    setError('');
    setMessage('');
    try {
      await api.put(`/faculty/students/${id}/verify?action=${action}`);
      setStudents(students.filter((st) => st.id !== id));
      setMessage(`Successfully ${action === 'APPROVE' ? 'verified' : 'rejected'} student registration request.`);
      setTimeout(() => setMessage(''), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify student.');
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
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Verify Student Registrations</h2>
        <p className="text-slate-400">Review pending student signups, check academic credentials, and verify profiles</p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          {message}
        </div>
      )}

      {students.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-800">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No pending verifications</h3>
          <p className="text-slate-500 mt-1">All registered students are verified and active.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Resume</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-white">{student.user.fullName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="h-3 w-3" />
                          {student.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-450">
                      {student.rollNumber || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {student.department || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-400">
                      {student.cgpa ? student.cgpa.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {student.skills ? (
                        <div className="flex flex-wrap gap-1">
                          {student.skills.split(',').slice(0, 2).map((skill, i) => (
                            <span key={i} className="bg-slate-800 text-xs px-2 py-0.5 rounded-full border border-slate-750">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.resumeUrl ? (
                        <a
                          href={student.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline font-semibold"
                        >
                          <FileText className="h-4 w-4" />
                          Resume
                        </a>
                      ) : (
                        <span className="text-slate-600">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerify(student.id, 'APPROVE')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-md shadow-emerald-950/20"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Verify
                        </button>
                        <button
                          onClick={() => handleVerify(student.id, 'REJECT')}
                          className="flex items-center gap-1.5 rounded-lg bg-rose-950/20 border border-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-455 hover:bg-rose-900/30 transition-all"
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

export default VerifyStudents;
