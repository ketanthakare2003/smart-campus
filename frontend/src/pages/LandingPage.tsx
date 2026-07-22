import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Users, ShieldCheck, Building, TrendingUp, Bell, Key, 
  Lock, ArrowRight, CheckCircle2, Menu, X, Code, Database, 
  Layers, Server, Globe, Cpu, Briefcase
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* 1. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => scrollToSection('home')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/20 shrink-0">
              <GraduationCap className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent inline-block pr-1">
              SmartCampus
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('home')} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Home</button>
            <button onClick={() => scrollToSection('about')} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">About</button>
            <button onClick={() => scrollToSection('features')} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('modules')} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Modules</button>
            <button onClick={() => scrollToSection('workflow')} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Workflow</button>
            <button onClick={() => scrollToSection('tech-stack')} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">Stack</button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-650 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-indigo-600 transition-all hover:scale-[1.02]"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-indigo-500 hover:to-indigo-600 transition-all hover:scale-[1.02]"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40 text-slate-450 hover:text-white md:hidden transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </header>

      {/* Mobile Slide-over Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-y-0 right-0 w-64 border-l border-slate-900 bg-slate-950 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
                <GraduationCap className="h-6 w-6 text-indigo-400" />
                <span className="font-bold text-sm text-white">SmartCampus Menu</span>
              </div>
              <nav className="flex flex-col gap-4">
                <button onClick={() => scrollToSection('home')} className="text-left text-xs font-semibold text-slate-450 hover:text-white transition-colors">Home</button>
                <button onClick={() => scrollToSection('about')} className="text-left text-xs font-semibold text-slate-455 hover:text-white transition-colors">About</button>
                <button onClick={() => scrollToSection('features')} className="text-left text-xs font-semibold text-slate-455 hover:text-white transition-colors">Features</button>
                <button onClick={() => scrollToSection('modules')} className="text-left text-xs font-semibold text-slate-455 hover:text-white transition-colors">Modules</button>
                <button onClick={() => scrollToSection('workflow')} className="text-left text-xs font-semibold text-slate-455 hover:text-white transition-colors">Workflow</button>
                <button onClick={() => scrollToSection('tech-stack')} className="text-left text-xs font-semibold text-slate-455 hover:text-white transition-colors">Stack</button>
              </nav>
            </div>
            
            <div className="border-t border-slate-900 pt-4 flex flex-col gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-650 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg border border-slate-800 bg-slate-900 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg bg-indigo-650 py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section id="home" className="relative overflow-hidden py-20 lg:py-28">
        
        {/* Abstract Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl lg:h-96 lg:w-96"></div>
        <div className="absolute top-10 left-10 -z-10 h-48 w-48 rounded-full bg-violet-650/5 blur-3xl"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-12 items-center">
          
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-4xs font-bold uppercase tracking-wider text-indigo-400">
              ⚡ Unified ERP & Campus System
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Smart Campus <br />
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            <p className="text-xs font-semibold text-slate-450 leading-relaxed max-w-2xl">
              A comprehensive ERP and Placement ecosystem connecting students, academic faculty, recruiters, and administrators. 
              Accelerate registrations, automate placement verification checks, and display real-time hiring metrics inside a single platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-indigo-650 px-6 py-3.5 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-600 transition-all hover:scale-[1.02]"
                >
                  Access Your Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-xl bg-indigo-650 px-6 py-3.5 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-600 transition-all hover:scale-[1.02]"
                  >
                    Login to System
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition-all hover:scale-[1.02]"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Illustration (SVG) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md p-4 bg-slate-900/30 border border-slate-900 rounded-3xl backdrop-blur shadow-2xl">
              <svg className="w-full h-auto text-indigo-500" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Grid */}
                <rect x="10" y="10" width="480" height="380" rx="20" fill="#020617" stroke="#1e293b" strokeWidth="2"/>
                <line x1="10" y1="80" x2="490" y2="80" stroke="#1e293b" strokeWidth="2" />
                
                {/* Browser Buttons */}
                <circle cx="40" cy="45" r="6" fill="#ef4444" />
                <circle cx="60" cy="45" r="6" fill="#f59e0b" />
                <circle cx="80" cy="45" r="6" fill="#10b981" />
                
                {/* Navbar Bar */}
                <rect x="120" y="38" width="260" height="14" rx="7" fill="#1e293b" />
                
                {/* Dashboard layout blocks */}
                {/* Left Sidebar */}
                <rect x="30" y="110" width="100" height="250" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <rect x="45" y="130" width="70" height="8" rx="4" fill="#334155" />
                <rect x="45" y="160" width="70" height="8" rx="4" fill="#334155" />
                <rect x="45" y="190" width="70" height="8" rx="4" fill="#334155" />
                
                {/* Charts block */}
                <rect x="150" y="110" width="310" height="130" rx="12" fill="#0f172a" stroke="#4f46e5" strokeWidth="1.5" />
                {/* Bar chart graphics inside */}
                <rect x="180" y="150" width="16" height="70" rx="4" fill="#6366f1" />
                <rect x="210" y="170" width="16" height="50" rx="4" fill="#818cf8" />
                <rect x="240" y="135" width="16" height="85" rx="4" fill="#4f46e5" />
                <rect x="270" y="160" width="16" height="60" rx="4" fill="#a5b4fc" />
                <rect x="300" y="180" width="16" height="40" rx="4" fill="#312e81" />
                
                {/* Placement Stats Circular indicator */}
                <circle cx="400" cy="175" r="30" stroke="#1e293b" strokeWidth="6" fill="none" />
                <circle cx="400" cy="175" r="30" stroke="#10b981" strokeWidth="6" strokeDasharray="140, 190" fill="none" strokeLinecap="round" />
                <text x="400" y="180" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">92%</text>
                
                {/* Details list bottom */}
                <rect x="150" y="260" width="310" height="100" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <rect x="170" y="285" width="120" height="8" rx="4" fill="#10b981" />
                <rect x="170" y="305" width="200" height="6" rx="3" fill="#334155" />
                <rect x="170" y="325" width="160" height="6" rx="3" fill="#334155" />
                
                {/* Cursor icon */}
                <path d="M430 330 L445 350 L452 342 L438 326 Z" fill="#6366f1" />
                <path d="M430 330 L430 345 L436 338 Z" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="py-16 border-t border-slate-900/60 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="text-indigo-400 font-bold text-4xs uppercase tracking-wider">Our Goal & Philosophy</span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simplifying Academic Operations
            </h2>
            <div className="h-1.5 w-16 bg-indigo-650 mx-auto rounded-full"></div>
            <p className="text-xs font-semibold text-slate-455 leading-relaxed pt-2">
              The Smart Campus Management System is an enterprise-grade ERP designed to unify student information structures and automate corporate recruitment workflows. By offering high-fidelity dashboards and integrating modern verification loops, we empower universities to operate placement drives, publish notice boards, verify student CGPAs, and check security access with zero manual oversight.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-20 border-t border-slate-900/60 bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-indigo-400 font-bold text-4xs uppercase tracking-wider">Features Overview</span>
            <h2 className="text-3xl font-bold text-white">Full-Featured ERP Capabilities</h2>
            <p className="text-slate-450 text-xs font-semibold max-w-2xl mx-auto">
              Inspect the comprehensive collection of modules designed to orchestrate security, placements, and campus affairs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Feature 1 */}
            <div className="glass p-5 rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="h-10 w-10 rounded-xl bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/10 group-hover:bg-indigo-650 group-hover:text-white transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Student Profiles</h3>
              <p className="text-3xs text-slate-450 leading-relaxed font-semibold">
                LinkedIn-style digital dashboards showing academic metrics, skills chips, verified tags, and resume links.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-5 rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="h-10 w-10 rounded-xl bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/10 group-hover:bg-indigo-650 group-hover:text-white transition-colors">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Placement Automation</h3>
              <p className="text-3xs text-slate-450 leading-relaxed font-semibold">
                Recruiters publish jobs specifying batch years, department codes, and CGPA thresholds verified automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass p-5 rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="h-10 w-10 rounded-xl bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/10 group-hover:bg-indigo-650 group-hover:text-white transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Faculty Verification</h3>
              <p className="text-3xs text-slate-450 leading-relaxed font-semibold">
                Instructors review student registration sheets, verify roll statistics, and modify student CGPA values.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass p-5 rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="h-10 w-10 rounded-xl bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/10 group-hover:bg-indigo-650 group-hover:text-white transition-colors">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Recruitment Pipeline</h3>
              <p className="text-3xs text-slate-450 leading-relaxed font-semibold">
                Companies track applicant portfolios, update hiring stages (Applied, Selected, Shortlisted), and download resumes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass p-5 rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="h-10 w-10 rounded-xl bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/10 group-hover:bg-indigo-650 group-hover:text-white transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Analytics Engine</h3>
              <p className="text-3xs text-slate-450 leading-relaxed font-semibold">
                Interactive radial selection rates, department student distributions, and hiring progress graphics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass p-5 rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="h-10 w-10 rounded-xl bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/10 group-hover:bg-indigo-650 group-hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Alert Dispatches</h3>
              <p className="text-3xs text-slate-450 leading-relaxed font-semibold">
                Database-backed dashboard notification logs combined with asynchronous, responsive HTML email dispatches.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="glass p-5 rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="h-10 w-10 rounded-xl bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/10 group-hover:bg-indigo-650 group-hover:text-white transition-colors">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Secure Recovery</h3>
              <p className="text-3xs text-slate-450 leading-relaxed font-semibold">
                Protected forgot password requests using secure UUID tokens that expire after 1 hour with BCrypt hashes.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="glass p-5 rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all hover:translate-y-[-4px] group">
              <div className="h-10 w-10 rounded-xl bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/10 group-hover:bg-indigo-650 group-hover:text-white transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Role Access Control</h3>
              <p className="text-3xs text-slate-450 leading-relaxed font-semibold">
                Granular Spring Security filtering protecting specific endpoints for students, faculty, TPOs, companies, and admins.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. USER ROLES SECTION */}
      <section id="modules" className="py-20 border-t border-slate-900/60 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-indigo-400 font-bold text-4xs uppercase tracking-wider">Ecosystem Participants</span>
            <h2 className="text-3xl font-bold text-white">Five Specialized User Dashboards</h2>
            <p className="text-slate-455 text-xs font-semibold max-w-xl mx-auto">
              Smart Campus distributes administrative responsibilities across targeted modules.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-5">
            
            {/* Student Card */}
            <div className="glass p-4 rounded-xl border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-3xs font-extrabold text-indigo-400 uppercase tracking-widest block bg-indigo-500/5 py-1 px-2.5 rounded border border-indigo-550/10 w-fit">STUDENT</span>
                <p className="text-3xs text-slate-450 font-semibold leading-relaxed">
                  Apply for eligibility-matched recruitment listings, upload resumes, verify notice boards, and review profile strength.
                </p>
              </div>
              <div className="border-t border-slate-900 pt-3 mt-4 text-4xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>View Mode</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              </div>
            </div>

            {/* Faculty Card */}
            <div className="glass p-4 rounded-xl border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-3xs font-extrabold text-emerald-450 uppercase tracking-widest block bg-emerald-500/5 py-1 px-2.5 rounded border border-emerald-550/10 w-fit">FACULTY</span>
                <p className="text-3xs text-slate-455 font-semibold leading-relaxed">
                  Approve/verify student profiles, correct academic CGPA logs, post notice bulletins, and monitor student metrics.
                </p>
              </div>
              <div className="border-t border-slate-900 pt-3 mt-4 text-4xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Verify Mode</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            </div>

            {/* TPO Card */}
            <div className="glass p-4 rounded-xl border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-3xs font-extrabold text-cyan-405 uppercase tracking-widest block bg-cyan-500/5 py-1 px-2.5 rounded border border-cyan-550/10 w-fit">TPO</span>
                <p className="text-3xs text-slate-455 font-semibold leading-relaxed">
                  Establish campus placement drives, generate security signup codes for company HR agencies, and audit system activities.
                </p>
              </div>
              <div className="border-t border-slate-900 pt-3 mt-4 text-4xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Drive Mode</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
              </div>
            </div>

            {/* Company Card */}
            <div className="glass p-4 rounded-xl border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-3xs font-extrabold text-amber-450 uppercase tracking-widest block bg-amber-500/5 py-1 px-2.5 rounded border border-amber-550/10 w-fit">COMPANY</span>
                <p className="text-3xs text-slate-455 font-semibold leading-relaxed">
                  Post job openings with target requirements, track applicant pipelines, view candidate resumes, and update recruitment states.
                </p>
              </div>
              <div className="border-t border-slate-900 pt-3 mt-4 text-4xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>HR Pipeline</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              </div>
            </div>

            {/* Admin Card */}
            <div className="glass p-4 rounded-xl border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-3xs font-extrabold text-rose-455 uppercase tracking-widest block bg-rose-500/5 py-1 px-2.5 rounded border border-rose-550/10 w-fit">ADMIN</span>
                <p className="text-3xs text-slate-455 font-semibold leading-relaxed">
                  Control all user profiles, toggle account suspensions/roles, monitor event timelines, and review central campus analytics.
                </p>
              </div>
              <div className="border-t border-slate-900 pt-3 mt-4 text-4xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Full Access</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. PLACEMENT WORKFLOW SECTION */}
      <section id="workflow" className="py-20 border-t border-slate-900/60 bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-indigo-400 font-bold text-4xs uppercase tracking-wider">Pipeline Flow</span>
            <h2 className="text-3xl font-bold text-white">The Placement Lifecycle</h2>
            <p className="text-slate-450 text-xs font-semibold max-w-xl mx-auto">
              Follow the automated verification and recruitment sequence built into the ecosystem.
            </p>
          </div>

          {/* Timeline Nodes */}
          <div className="relative flex flex-col md:flex-row md:justify-between items-center gap-8 max-w-5xl mx-auto">
            {/* Visual connector line for desktop */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-900 -translate-y-1/2 -z-10 hidden md:block"></div>
            
            {/* Step 1 */}
            <div className="glass p-4 rounded-xl border border-slate-900 bg-slate-950 text-center space-y-1 w-44 hover:border-slate-800 transition-colors z-10 relative">
              <span className="text-3xs font-extrabold text-indigo-400 block uppercase tracking-wider">Step 1</span>
              <h4 className="text-2xs font-bold text-white leading-tight">Student Signup</h4>
              <p className="text-4xs text-slate-500 font-semibold leading-relaxed">Registers profile details & skills.</p>
            </div>

            {/* Step 2 */}
            <div className="glass p-4 rounded-xl border border-slate-900 bg-slate-950 text-center space-y-1 w-44 hover:border-slate-800 transition-colors z-10 relative">
              <span className="text-3xs font-extrabold text-indigo-400 block uppercase tracking-wider">Step 2</span>
              <h4 className="text-2xs font-bold text-white leading-tight">Faculty Audit</h4>
              <p className="text-4xs text-slate-500 font-semibold leading-relaxed">Verifies roll numbers & records.</p>
            </div>

            {/* Step 3 */}
            <div className="glass p-4 rounded-xl border border-slate-900 bg-slate-950 text-center space-y-1 w-44 hover:border-slate-800 transition-colors z-10 relative">
              <span className="text-3xs font-extrabold text-indigo-400 block uppercase tracking-wider">Step 3</span>
              <h4 className="text-2xs font-bold text-white leading-tight">Profile Lock</h4>
              <p className="text-4xs text-slate-500 font-semibold leading-relaxed">Transitions page to view mode.</p>
            </div>

            {/* Step 4 */}
            <div className="glass p-4 rounded-xl border border-slate-900 bg-slate-950 text-center space-y-1 w-44 hover:border-slate-800 transition-colors z-10 relative">
              <span className="text-3xs font-extrabold text-indigo-400 block uppercase tracking-wider">Step 4</span>
              <h4 className="text-2xs font-bold text-white leading-tight">Eligibility Match</h4>
              <p className="text-4xs text-slate-500 font-semibold leading-relaxed">Autochecks CGPA, Batch & Dept.</p>
            </div>

            {/* Step 5 */}
            <div className="glass p-4 rounded-xl border border-slate-900 bg-slate-950 text-center space-y-1 w-44 hover:border-slate-800 transition-colors z-10 relative">
              <span className="text-3xs font-extrabold text-indigo-400 block uppercase tracking-wider">Step 5</span>
              <h4 className="text-2xs font-bold text-white leading-tight">Job Application</h4>
              <p className="text-4xs text-slate-500 font-semibold leading-relaxed">Sends resume to recruiter logs.</p>
            </div>

            {/* Step 6 */}
            <div className="glass p-4 rounded-xl border border-slate-900 bg-slate-950 text-center space-y-1 w-44 hover:border-slate-800 transition-colors z-10 relative">
              <span className="text-3xs font-extrabold text-indigo-400 block uppercase tracking-wider">Step 6</span>
              <h4 className="text-2xs font-bold text-white leading-tight">Hiring Selection</h4>
              <p className="text-4xs text-slate-500 font-semibold leading-relaxed">Recruiter approves application status.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. STATISTICS SECTION */}
      <section className="py-16 border-t border-slate-900 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4 text-center">
            
            <div className="glass p-6 rounded-2xl border border-slate-900">
              <span className="text-3xl font-extrabold text-white block bg-gradient-to-r from-indigo-400 to-indigo-500 bg-clip-text text-transparent">5000+</span>
              <span className="text-3xs uppercase tracking-widest text-slate-500 font-bold block mt-1.5">Students Registered</span>
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-900">
              <span className="text-3xl font-extrabold text-white block bg-gradient-to-r from-indigo-400 to-indigo-500 bg-clip-text text-transparent">150+</span>
              <span className="text-3xs uppercase tracking-widest text-slate-500 font-bold block mt-1.5">Recruiting Partners</span>
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-900">
              <span className="text-3xl font-extrabold text-white block bg-gradient-to-r from-indigo-400 to-indigo-500 bg-clip-text text-transparent">350+</span>
              <span className="text-3xs uppercase tracking-widest text-slate-500 font-bold block mt-1.5">Jobs Completed</span>
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-900">
              <span className="text-3xl font-extrabold text-white block bg-gradient-to-r from-indigo-400 to-indigo-500 bg-clip-text text-transparent">98%</span>
              <span className="text-3xs uppercase tracking-widest text-slate-500 font-bold block mt-1.5">Success Rating</span>
            </div>

          </div>
        </div>
      </section>

      {/* 8. TECHNOLOGY STACK SECTION */}
      <section id="tech-stack" className="py-20 border-t border-slate-900/60 bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-indigo-400 font-bold text-4xs uppercase tracking-wider">Platform Engine</span>
            <h2 className="text-3xl font-bold text-white">Robust Engineering Stack</h2>
            <p className="text-slate-455 text-xs font-semibold max-w-xl mx-auto">
              Smart Campus runs on modern, secure frameworks.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Cpu className="h-4 w-4 text-indigo-400" /> Java 17
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Server className="h-4 w-4 text-indigo-400" /> Spring Boot
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Lock className="h-4 w-4 text-rose-400" /> Spring Security
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Database className="h-4 w-4 text-cyan-400" /> Hibernate ORM
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Code className="h-4 w-4 text-indigo-400" /> React 18
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Layers className="h-4 w-4 text-blue-400" /> TypeScript
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Database className="h-4 w-4 text-cyan-405" /> PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Globe className="h-4 w-4 text-indigo-455" /> REST APIs
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors">
              <Key className="h-4 w-4 text-emerald-400" /> JWT Sessions
            </span>
          </div>

        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-2 items-center">
          
          <div className="text-left space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
              <span className="font-bold text-white text-base">SmartCampus</span>
            </div>
            <p className="text-3xs text-slate-500 leading-relaxed font-semibold">
              Enterprise-grade Academic & Placement ERP Ecosystem. All campus administration operations managed dynamically.
            </p>
          </div>

          <div className="text-left md:text-right space-y-2">
            <span className="text-4xs text-slate-500 block uppercase tracking-wider font-extrabold">Developed by</span>
            <span className="text-xs font-bold text-slate-300 block">Smart Campus Development Team</span>
            <span className="text-4xs text-slate-500 block">&copy; {new Date().getFullYear()} Smart Campus. All rights reserved.</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
