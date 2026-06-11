import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav";
import { useAuth } from "@/lib/AuthContext";
import Login from "@/pages/Login";
import { isSandboxActive, setSandboxActive, supabaseUrl } from "@/supabase";
import { toast } from "sonner";
import { useProductivity } from "@/lib/ProductivityContext";
import { ChevronRight, Database, HelpCircle, CheckCircle2, UserCheck, ShieldCheck, HelpCircle as Help } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const { user, loading } = useAuth();
  const { preferences, onboardingCompleted, completeOnboarding } = useProductivity();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  // Onboarding states
  const [onboardStep, setOnboardStep] = useState(1);
  const [persona, setPersona] = useState("Developer");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  const isSandbox = isSandboxActive();

  const getProjectId = () => {
    try {
      return supabaseUrl.replace('https://', '').split('.')[0];
    } catch {
      return 'ysnwuehcbvnevuuqcyyx';
    }
  };

  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#6F4E37]/15 border-t-[#6F4E37] rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#6F4E37] font-semibold">Synergizing CreamFlow Workspace</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // First-Time Onboarding Sequencer (Wizard layout)
  if (!onboardingCompleted) {
    const handleNextStep = () => {
      if (onboardStep === 3 && !workspaceName.trim()) {
        toast.warning("Please name your workspace first.");
        return;
      }
      if (onboardStep === 4 && !projectName.trim()) {
        toast.warning("Please specify a project tracker name.");
        return;
      }
      if (onboardStep === 5 && !taskTitle.trim()) {
        toast.warning("Please designate your first focus task.");
        return;
      }
      setOnboardStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
      setOnboardStep(prev => Math.max(1, prev - 1));
    };

    const toggleGoal = (goal: string) => {
      if (selectedGoals.includes(goal)) {
        setSelectedGoals(prev => prev.filter(g => g !== goal));
      } else {
        setSelectedGoals(prev => [...prev, goal]);
      }
    };

    const runCompletion = () => {
      completeOnboarding(
        persona,
        selectedGoals.length > 0 ? selectedGoals : ["Personal Productivity"],
        workspaceName.trim() || "Main Workspace",
        projectName.trim() || "Productivity Sprint",
        taskTitle.trim() || "Design Core System"
      );
    };

    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="absolute inset-0 bg-radial from-[#6F4E37]/[0.05] to-transparent pointer-events-none" />
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/10 shadow-xl relative z-10">
          
          {/* Header Progress indicator */}
          <div className="flex items-center justify-between mb-8 border-b border-[#6F4E37]/10 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4A017]">Setup Wizard</span>
              <h2 className="text-xl font-serif font-black text-[#6F4E37]">Setup CreamFlow</h2>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] bg-[#6F4E37]/5 px-2.5 py-1 rounded-lg text-[#6F4E37] font-bold">
              <span>STEP</span>
              <span className="text-[#D4A017]">{onboardStep}</span>
              <span>/ 5</span>
            </div>
          </div>

          {/* Stepper Content */}
          {onboardStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#6F4E37]">Welcome to CreamFlow</h3>
                <p className="text-xs text-[#7A6F62]">Please customize your workspace persona. What describes your core focus?</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {["Developer", "Student", "Freelancer", "Entrepreneur", "Professional", "Personal Use"].map(p => (
                  <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`p-3 text-xs font-bold rounded-xl border text-left transition-all ${
                      persona === p
                        ? "bg-[#6F4E37] text-white border-transparent shadow"
                        : "bg-white border-[#6F4E37]/15 text-[#2E2E2E] hover:bg-[#6F4E37]/5"
                    }`}
                  >
                    <span>☕ {p}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {onboardStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#6F4E37]">Select Workspace Objectives</h3>
                <p className="text-xs text-[#7A6F62]">Which metrics and targets are you tracking in this campaign?</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {[
                  { id: "Learn Coding", icon: "💻" },
                  { id: "Find a Job", icon: "💼" },
                  { id: "Grow Business", icon: "📈" },
                  { id: "Fitness", icon: "💪" },
                  { id: "Personal Productivity", icon: "⏱️" },
                  { id: "Education", icon: "📚" }
                ].map(g => {
                  const selected = selectedGoals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      className={`p-3 text-xs font-bold rounded-xl border text-left transition-all flex items-center gap-2 ${
                        selected
                          ? "bg-[#6F4E37] text-white border-transparent"
                          : "bg-white border-[#6F4E37]/15 text-[#2E2E2E] hover:bg-[#6F4E37]/5"
                      }`}
                    >
                      <span>{g.icon}</span>
                      <span>{g.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {onboardStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#6F4E37]">Launch Your Workspace</h3>
                <p className="text-xs text-[#7A6F62]">Every SaaS campaign operates within isolated, secure workspaces.</p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">Workspace Title</label>
                <input
                  type="text"
                  placeholder="E.g. Alexander's HQ, Dev-Arena"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full p-3 text-xs font-bold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] placeholder-[#7A6F62]/50 bg-[#FFF8E7]/45"
                  required
                />
              </div>
            </div>
          )}

          {onboardStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#6F4E37]">Create Key Project Tracker</h3>
                <p className="text-xs text-[#7A6F62]">Organize tasks, estimations, and achievements inside milestones.</p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">Project Name</label>
                <input
                  type="text"
                  placeholder="E.g. Portfolio Website, React Masterclass"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-3 text-xs font-bold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] placeholder-[#7A6F62]/50 bg-[#FFF8E7]/45"
                  required
                />
              </div>
            </div>
          )}

          {onboardStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-[#6F4E37]">Designate Your First Project Task</h3>
                <p className="text-xs text-[#7A6F62]">Kickstart the metrics workspace with one actionable sprint objective.</p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">Task Title</label>
                <input
                  type="text"
                  placeholder="E.g. Refactor API endpoints, Build responsive layout"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-3 text-xs font-bold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] placeholder-[#7A6F62]/50 bg-[#FFF8E7]/45"
                  required
                />
              </div>
            </div>
          )}

          {/* Nav buttons inside wizard */}
          <div className="flex justify-between items-center gap-3 mt-8 border-t border-[#6F4E37]/10 pt-4">
            <button
              onClick={handlePrevStep}
              disabled={onboardStep === 1}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-[#6F4E37]/20 text-[#6F4E37] disabled:opacity-30 hover:bg-[#6F4E37]/5 cursor-pointer"
            >
              Previous
            </button>

            {onboardStep < 5 ? (
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 text-xs text-white bg-[#6F4E37] hover:bg-[#5a3e2b] font-bold rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={runCompletion}
                className="px-6 py-2.5 text-xs text-white bg-[#6F4E37] hover:bg-[#5a3e2b] font-serif font-black rounded-xl cursor-pointer shadow-lg hover:scale-[1.01] transition-all"
              >
                Launch Dashboard ☕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7] relative text-[#2E2E2E]">
      
      {/* Sandbox/Offline notice bar */}
      {isSandbox && (
        <div className="bg-white border-b border-[#6F4E37]/15 text-[#6F4E37] text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3 relative z-50 shadow-sm font-sans font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse" />
            <span>
              CreamFlow Local Sandbox Mode Active (Local Storage Syncing Securely).
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSqlGuide(true)}
              className="px-2.5 py-1 bg-[#6F4E37]/10 hover:bg-[#6F4E37]/15 text-[#6F4E37] transition-all text-[9px] font-bold rounded-lg uppercase tracking-wider"
            >
              Examine Supabase SQL
            </button>
            <button
              onClick={() => {
                setSandboxActive(false);
                window.location.reload();
              }}
              className="px-3 py-1 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white transition-all text-[9px] font-bold rounded-lg uppercase tracking-wider shadow-sm"
            >
              Verify Dev Server
            </button>
          </div>
        </div>
      )}

      {/* SQL Setup Modal */}
      {showSqlGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
          <div className="bg-white border border-[#6F4E37]/15 max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-[#2E2E2E]">
            <h2 className="text-xl font-serif font-black text-[#6F4E37] flex items-center gap-2">
              📂 Supabase SaaS Database Setup
            </h2>
            <p className="text-xs text-[#7A6F62] leading-relaxed">
              Ensure your database project (<strong>{getProjectId()}</strong>) is unpaused in the Supabase Dashboard. Paste and run this SQL schema to map workspaces, tasks, achievements, and statistics perfectly:
            </p>
            <div className="relative">
              <pre className="text-[10px] bg-[#FFF8E7] p-4 rounded-xl text-[#6F4E37] overflow-x-auto max-h-52 overflow-y-auto border border-[#6F4E37]/15 font-mono">
{`-- 1. Create Profile and Preferences
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Create projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    deadline TIMESTAMPTZ,
    milestones TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Create tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'Todo',
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    estimated_time NUMERIC DEFAULT 1,
    actual_time NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Goals management
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'monthly',
    target_date TIMESTAMPTZ,
    progress INTEGER DEFAULT 0,
    milestones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);`}
              </pre>
            </div>
            <div className="flex justify-between items-center pt-2 gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`-- Clean CreamFlow tables setup\nCREATE TABLE IF NOT EXISTS public.workspaces (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL);`);
                  toast.success("SQL stub schema copied!");
                }}
                className="px-4 py-2 bg-[#6F4E37] text-white font-bold rounded-xl text-xs transition hover:bg-[#5a3e2b]"
              >
                Copy SQL Stub
              </button>
              <button 
                onClick={() => setShowSqlGuide(false)}
                className="px-4 py-2 bg-[#FFF8E7] text-[#6F4E37] border border-[#6F4E37]/20 font-bold rounded-xl text-xs transition hover:bg-[#6F4E37]/5"
              >
                Close Guidance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentPage={currentPageName}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile nav */}
      <MobileNav currentPage={currentPageName} />

      {/* Main content wrapper */}
      <main
        className="relative z-10 transition-all duration-300 min-h-screen"
        style={{ marginLeft: isMd ? (sidebarCollapsed ? 72 : 260) : 0 }}
      >
        <div className="pt-16 pb-20 md:pt-0 md:pb-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
