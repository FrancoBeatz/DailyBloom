import React, { useState, useEffect } from "react";
import { useProductivity, Project } from "@/lib/ProductivityContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Layers,
  Sparkles,
  BookOpen,
  Terminal,
  CheckSquare,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpenCheck,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Cpu,
  Bookmark,
  Coffee,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import PremiumTooltip from "@/components/PremiumTooltip";

interface JobApplication {
  id: string;
  company: string;
  role: string;
  stage: "Applied" | "Interview" | "Offer" | "Rejected";
  salary: string;
  notes: string;
}

interface InterviewPrep {
  id: string;
  topic: string;
  type: "System Design" | "Algorithms" | "Behavioral" | "Frontend" | "DB / SQL";
  status: "Review Required" | "Familiar" | "Mastered";
  notes: string;
}

export default function DeveloperMatrix() {
  const {
    tasks,
    projects,
    developerMetrics,
    updateDeveloperHours,
    updateTask,
    deleteProject,
    addProject,
    addTask
  } = useProductivity();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "jobs" | "interviews">("overview");

  // Local persisted states for Job applications and Interview Prep (encapsulated for CreamFlow)
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
    const val = localStorage.getItem("creamflow_matrix_jobs");
    return val ? JSON.parse(val) : [];
  });

  const [interviewPreps, setInterviewPreps] = useState<InterviewPrep[]>(() => {
    const val = localStorage.getItem("creamflow_matrix_preps");
    return val ? JSON.parse(val) : [];
  });

  useEffect(() => {
    localStorage.setItem("creamflow_matrix_jobs", JSON.stringify(jobApplications));
  }, [jobApplications]);

  useEffect(() => {
    localStorage.setItem("creamflow_matrix_preps", JSON.stringify(interviewPreps));
  }, [interviewPreps]);

  // Form states
  const [submittingHours, setSubmittingHours] = useState(false);
  const [addCodingHours, setAddCodingHours] = useState(1);
  const [addLearningHours, setAddLearningHours] = useState(1);

  // Project creator states
  const [showProjForm, setShowProjForm] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projOverview, setProjOverview] = useState("");
  const [projTargetDate, setProjTargetDate] = useState("");

  // Job form states
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobCompany, setJobCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobNotes, setJobNotes] = useState("");

  // Interview study form states
  const [showIntForm, setShowIntForm] = useState(false);
  const [intTopic, setIntTopic] = useState("");
  const [intType, setIntType] = useState<InterviewPrep["type"]>("Algorithms");
  const [intStatus, setIntStatus] = useState<InterviewPrep["status"]>("Review Required");
  const [intNotes, setIntNotes] = useState("");

  // Quick project task line
  const [projectTaskInput, setProjectTaskInput] = useState<{ [projId: string]: string }>({});

  const handleHourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeveloperHours(Number(addCodingHours), Number(addLearningHours));
    setAddCodingHours(1);
    setAddLearningHours(1);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    addProject(projTitle.trim(), projOverview.trim(), projTargetDate, ["Initial Spec Map", "Production Run v1"]);
    setProjTitle("");
    setProjOverview("");
    setProjTargetDate("");
    setShowProjForm(false);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobCompany.trim() || !jobRole.trim()) return;
    const newJob: JobApplication = {
      id: "job_" + Math.random().toString(36).substring(2, 9),
      company: jobCompany.trim(),
      role: jobRole.trim(),
      stage: "Applied",
      salary: jobSalary.trim(),
      notes: jobNotes.trim()
    };
    setJobApplications(prev => [newJob, ...prev]);
    setJobCompany("");
    setJobRole("");
    setJobSalary("");
    setJobNotes("");
    setShowJobForm(false);
    toast.success(`Tracking role at ${newJob.company}`);
  };

  const handleCreateInterviewPrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intTopic.trim()) return;
    const newPrep: InterviewPrep = {
      id: "prep_" + Math.random().toString(36).substring(2, 9),
      topic: intTopic.trim(),
      type: intType,
      status: intStatus,
      notes: intNotes.trim()
    };
    setInterviewPreps(prev => [newPrep, ...prev]);
    setIntTopic("");
    setIntNotes("");
    setShowIntForm(false);
    toast.success(`Study deck added: "${newPrep.topic}"`);
  };

  const deleteJob = (id: string) => {
    setJobApplications(prev => prev.filter(j => j.id !== id));
    toast.info("Application deleted");
  };

  const updateJobStage = (id: string, stage: JobApplication["stage"]) => {
    setJobApplications(prev => prev.map(j => j.id === id ? { ...j, stage } : j));
    toast.success(`Pipeline stage updated to ${stage}`);
  };

  const deletePrep = (id: string) => {
    setInterviewPreps(prev => prev.filter(p => p.id !== id));
    toast.info("Study item removed");
  };

  const updatePrepStatus = (id: string, status: InterviewPrep["status"]) => {
    setInterviewPreps(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    toast.success(`Confidence score set to ${status}`);
  };

  const handleAddProjTask = (projId: string) => {
    const input = projectTaskInput[projId];
    if (!input || !input.trim()) return;
    addTask({
      title: input.trim(),
      description: "Project Sprints Layer",
      due_date: new Date().toISOString().split("T")[0],
      priority: "medium",
      tags: ["Sprint"],
      status: "Todo",
      estimated_time: 1,
      actual_time: 0,
      project_id: projId
    });
    setProjectTaskInput(prev => ({ ...prev, [projId]: "" }));
  };

  // Compute coding task values
  const codingTasks = tasks.filter(t => t.tags.includes("Code") || t.tags.includes("Sprint"));
  const codingTaskCount = codingTasks.length;
  const completedCodingCount = codingTasks.filter(t => t.status === "Complete").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-sans text-[#2E2E2E]">
      
      {/* Upper Brand panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#6F4E37]/10 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-[10px] bg-[#6F4E37]/5 px-2.5 py-1 rounded-md text-[#6F4E37] font-mono tracking-widest font-black uppercase">
            CreamFlow Engineering Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#6F4E37] tracking-tight mt-2.5">
            Developer Matrix <span className="font-sans text-xs italic text-[#7A6F62] ml-1">Engineering and Career Ledger</span>
          </h1>
          <p className="text-xs text-[#7A6F62] mt-1 font-medium leading-relaxed">
            Record actual coding session hours, maintain your recruitment pipeline funnel, and test algorithmic memory thresholds.
          </p>
        </div>

        {/* Global Stats indicators */}
        <div className="flex gap-3">
          <div className="bg-[#FFF8E7] border border-[#6F4E37]/15 px-4 py-2 rounded-2xl text-center shadow-sm">
            <span className="text-[9px] text-[#7A6F62] uppercase tracking-wider font-mono block font-bold">Total Sprints</span>
            <span className="text-sm font-bold text-[#6F4E37] font-mono">
              {completedCodingCount} of {codingTaskCount} Done
            </span>
          </div>

          <div className="bg-[#FFF8E7] border border-[#6F4E37]/15 px-4 py-2 rounded-2xl text-center shadow-sm">
            <span className="text-[9px] text-[#7A6F62] uppercase tracking-wider font-mono block font-bold">Applications</span>
            <span className="text-sm font-bold text-[#D4A017] font-mono">
              {jobApplications.length} tracked
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 bg-[#FFF8E7] p-1.5 rounded-2xl border border-[#6F4E37]/10 w-max overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "overview" ? "bg-[#6F4E37] text-white shadow-sm" : "text-[#7A6F62] hover:text-[#6F4E37]"
          }`}
        >
          Overview Core 🧠
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "projects" ? "bg-[#6F4E37] text-white shadow-sm" : "text-[#7A6F62] hover:text-[#6F4E37]"
          }`}
        >
          Code Milestones 📂
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "jobs" ? "bg-[#6F4E37] text-white shadow-sm" : "text-[#7A6F62] hover:text-[#6F4E37]"
          }`}
        >
          Pipeline Funnel 💼
        </button>

        <button
          onClick={() => setActiveTab("interviews")}
          className={`px-4 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "interviews" ? "bg-[#6F4E37] text-white shadow-sm" : "text-[#7A6F62] hover:text-[#6F4E37]"
          }`}
        >
          Interview Prep 💻
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          
          {/* TAB 0: OVERVIEW & HOUR LOG FORM */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Hour Accumulator card form */}
              <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/10 shadow-sm space-y-4">
                <div>
                  <h3 className="text-md font-serif font-black text-[#6F4E37]">Log Engineering Energy</h3>
                  <p className="text-xs text-[#7A6F62]">Add raw coding hours or algorithm training times into your dynamic audit profiles.</p>
                </div>

                <form onSubmit={handleHourSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">Log Additional Coding Hours</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={addCodingHours}
                      onChange={(e) => setAddCodingHours(Number(e.target.value))}
                      className="w-full text-xs font-bold bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">Log Study / Lecture Hours</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={addLearningHours}
                      onChange={(e) => setAddLearningHours(Number(e.target.value))}
                      className="w-full text-xs font-bold bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white font-serif font-black rounded-xl text-xs shadow transition cursor-pointer"
                  >
                    Lock Session Metrics ☕
                  </button>
                </form>
              </div>

              {/* Developer stats display blocks */}
              <div className="md:col-span-2 space-y-6">
                
                <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/10 shadow-sm grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FFF8E7]/30 rounded-2xl border border-[#6F4E37]/5 text-center">
                    <span className="text-[10px] text-[#7A6F62] uppercase tracking-wider block font-bold">Total Code Sprints Run</span>
                    <span className="text-3xl font-serif font-black text-[#6F4E37] block mt-2">{developerMetrics.coding_hours}h</span>
                    <p className="text-[9px] text-[#7A6F62] mt-1">Accumulated across deep focus sessions.</p>
                  </div>

                  <div className="p-4 bg-[#FFF8E7]/30 rounded-2xl border border-[#6F4E37]/5 text-center">
                    <span className="text-[10px] text-[#7A6F62] uppercase tracking-wider block font-bold">Target Study Prep</span>
                    <span className="text-3xl font-serif font-black text-[#6F4E37] block mt-2">{developerMetrics.learning_hours}h</span>
                    <p className="text-[9px] text-[#7A6F62] mt-1 font-semibold text-[#D4A017]">Algorithmic masteries tracker.</p>
                  </div>
                </div>

                <div className="p-5 bg-white border border-[#D4A017]/20 rounded-2xl flex gap-3 shadow-inner">
                  <Sparkles className="w-5 h-5 text-[#D4A017] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#6F4E37]">Proactive Portfolio Builder Blueprint</h4>
                    <p className="text-xs text-[#7A6F62] leading-relaxed">
                      Hiring managers prioritize candidates who treat learning like a scalable product. Maintain your <strong>Developer Matrix</strong>, log hours with deep focus blocks, and present physical proof-of-hours statistics in selection rounds.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 1: CODE MILESTONES / SYSTEM ARCHITECTURE */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center bg-white border border-[#6F4E37]/10 p-4 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-serif font-black text-[#6F4E37]">Project Architecture Milestones</h3>
                  <p className="text-xs text-[#7A6F62]">Formulate scalable side projects. Track milestones, feature phases, and code reviews.</p>
                </div>

                <button
                  onClick={() => setShowProjForm(true)}
                  className="px-4 py-2 text-xs bg-[#6F4E37] text-white hover:bg-[#5a3e2b] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Map Project</span>
                </button>
              </div>

              {/* Add Project Form Drawer */}
              {showProjForm && (
                <form onSubmit={handleCreateProject} className="p-5 bg-white rounded-3xl border border-[#6F4E37]/15 shadow space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Project Name (e.g. Distributed Chat Backend)..."
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      className="w-full text-xs font-bold bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                      required
                    />
                    <input
                      type="date"
                      value={projTargetDate}
                      onChange={(e) => setProjTargetDate(e.target.value)}
                      className="w-full text-xs bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none text-[#2E2E2E]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Overview / Technology Stack (e.g. Node, React, Redis)..."
                    value={projOverview}
                    onChange={(e) => setProjOverview(e.target.value)}
                    className="w-full text-xs bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowProjForm(false)} className="px-3 py-1.5 text-[#7A6F62]">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-[#6F4E37] text-white font-bold rounded-xl">Initialize</button>
                  </div>
                </form>
              )}

              {/* Active Project Milestones Cards list */}
              {projects.length === 0 ? (
                <div className="text-center py-10 bg-white/50 border border-dashed border-[#6F4E37]/15 rounded-3xl text-xs text-[#7A6F62]">
                  No mapped projects in state. Initialize above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map(proj => {
                    const subtasks = tasks.filter(t => t.project_id === proj.id);
                    const doneComps = subtasks.filter(t => t.status === "Complete").length;
                    return (
                      <div key={proj.id} className="bg-white p-5 rounded-3xl border border-[#6F4E37]/10 shadow-sm space-y-4 group relative">
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="absolute top-4 right-4 text-[#7A6F62] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="space-y-1">
                          <h4 className="text-base font-serif font-black text-[#6F4E37]">{proj.name}</h4>
                          {proj.description && <p className="text-xs text-[#7A6F62]">{proj.description}</p>}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#7A6F62]">
                            <span>Progress Scale</span>
                            <span className="text-[#D4A017]">{proj.progress}%</span>
                          </div>
                          <div className="w-full bg-[#FFF8E7] h-1.5 rounded-full overflow-hidden">
                            <div style={{ width: `${proj.progress}%` }} className="h-full bg-[#6F4E37] rounded-full transition-all" />
                          </div>
                        </div>

                        {/* Checklist subtasks map */}
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] uppercase font-bold text-[#6F4E37] block">Sprints Checklist ({doneComps}/{subtasks.length})</span>
                          
                          {subtasks.length === 0 ? (
                            <p className="text-[11px] text-[#7A6F62] italic pl-1">No feature phases mapped. Create below.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {subtasks.map(s => (
                                <div key={s.id} className="flex items-center gap-2 text-xs text-[#2E2E2E]">
                                  <input
                                    type="checkbox"
                                    checked={s.status === "Complete"}
                                    onChange={() => updateTask(s.id, { status: s.status === "Complete" ? "Todo" : "Complete" })}
                                    className="rounded border-[#6F4E37]/30 text-[#6F4E37] focus:ring-0 cursor-pointer"
                                  />
                                  <span className={s.status === "Complete" ? "line-through text-[#7A6F62]" : "text-[#2E2E2E]"}>{s.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick sprint creator */}
                        <div className="flex gap-2.5">
                          <input
                            type="text"
                            placeholder="Add instant sprint phase..."
                            value={projectTaskInput[proj.id] || ""}
                            onChange={(e) => setProjectTaskInput(prev => ({ ...prev, [proj.id]: e.target.value }))}
                            className="bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl px-3 py-1.5 text-xs placeholder-[#7A6F62]/60 focus:outline-none focus:border-[#6F4E37] text-[#2E2E2E] flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddProjTask(proj.id)}
                            className="px-3.5 py-1.5 bg-[#FFF8E7] rounded-xl border border-[#6F4E37]/25 text-[#6F4E37] text-[10px] uppercase font-bold tracking-wider"
                          >
                            + Phase
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECRUITMENT PIPELINE PIPES */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white border border-[#6F4E37]/10 p-4 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-serif font-black text-[#6F4E37]">Application Funnel Pipeline</h3>
                  <p className="text-xs text-[#7A6F62]">Keep active track of interviews, screening thresholds, salary specifications, and offers received.</p>
                </div>

                <button
                  onClick={() => setShowJobForm(true)}
                  className="px-4 py-2 text-xs bg-[#6F4E37] text-white hover:bg-[#5a3e2b] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Track Application</span>
                </button>
              </div>

              {/* Add Job application form */}
              {showJobForm && (
                <form onSubmit={handleCreateJob} className="p-5 bg-white rounded-3xl border border-[#6F4E37]/15 shadow space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Company (e.g. Vercel, Supabase)..."
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      className="w-full text-xs font-bold bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Senior Frontend)..."
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="w-full text-xs bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Estimated Salary Target (Optional)..."
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      className="w-full text-xs bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Interview checklist, logs, referral details, system study topics..."
                    value={jobNotes}
                    onChange={(e) => setJobNotes(e.target.value)}
                    className="w-full text-xs bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowJobForm(false)} className="px-3 py-1.5 text-[#7A6F62]">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-[#6F4E37] text-white font-bold rounded-xl">Track Role</button>
                  </div>
                </form>
              )}

              {/* Column Kanban style setup */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(["Applied", "Interview", "Offer", "Rejected"] as const).map(stage => {
                  const items = jobApplications.filter(j => j.stage === stage);
                  return (
                    <div key={stage} className="bg-[#FFF8E7]/35 border border-[#6F4E37]/10 p-4 rounded-3xl min-h-[400px] flex flex-col space-y-3">
                      <div className="flex justify-between items-center border-b border-[#6F4E37]/10 pb-1.5">
                        <span className="text-xs uppercase font-serif font-black text-[#6F4E37]">{stage}</span>
                        <span className="text-[10px] font-mono font-bold bg-[#6F4E37]/10 text-[#6F4E37] px-2 py-0.5 rounded-md">
                          {items.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[420px] scrollbar-hide">
                        {items.length === 0 ? (
                          <div className="py-10 text-center text-[10.5px] italic text-[#7A6F62]">
                            Stage empty
                          </div>
                        ) : (
                          items.map(job => (
                            <div key={job.id} className="bg-white p-3 rounded-2xl border border-[#6F4E37]/10 space-y-2 relative group hover:border-[#6F4E37]/30 transition shadow-sm">
                              <button
                                onClick={() => deleteJob(job.id)}
                                className="absolute top-2.5 right-2 text-[#7A6F62] hover:text-[#EF4444]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <h5 className="text-xs font-bold text-[#6F4E37]">{job.company}</h5>
                              <p className="text-[10.5px] text-[#7A6F62] leading-none">{job.role}</p>
                              
                              {job.salary && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#6F4E37]/5 text-[#6F4E37] font-semibold block w-max">
                                  💵 {job.salary}
                                </span>
                              )}

                              {job.notes && (
                                <p className="text-[10px] text-[#7A6F62] font-medium leading-relaxed bg-[#FFF8E7]/30 p-1.5 rounded-lg border border-[#6F4E37]/5">
                                  {job.notes}
                                </p>
                              )}

                              <div className="pt-2 border-t border-[#6F4E37]/5">
                                <select
                                  value={job.stage}
                                  onChange={(e) => updateJobStage(job.id, e.target.value as any)}
                                  className="w-full bg-[#FFF8E7] text-[10px] font-bold text-[#6F4E37] border-none focus:ring-0 rounded-lg p-1 text-center"
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Interview">Interviewing</option>
                                  <option value="Offer">Offer</option>
                                  <option value="Rejected">Pipeline Closed</option>
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: ALGORITHM PREPARATIONS confidence */}
          {activeTab === "interviews" && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center bg-white border border-[#6F4E37]/10 p-4 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-serif font-black text-[#6F4E37]">Interactive Algorithm Confidence Board</h3>
                  <p className="text-xs text-[#7A6F62]">Review System Designs, Algorithmic patterns and key data structures to present perfect analytical confidence.</p>
                </div>

                <button
                  onClick={() => setShowIntForm(true)}
                  className="px-4 py-2 text-xs bg-[#6F4E37] text-white hover:bg-[#5a3e2b] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create topic Tracker</span>
                </button>
              </div>

              {/* Add topic form */}
              {showIntForm && (
                <form onSubmit={handleCreateInterviewPrep} className="p-5 bg-white rounded-3xl border border-[#6F4E37]/15 shadow space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Algorithm topic (e.g. MapReduce systems)..."
                      value={intTopic}
                      onChange={(e) => setIntTopic(e.target.value)}
                      className="w-full text-xs font-bold bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                      required
                    />
                    <select
                      value={intType}
                      onChange={(e) => setIntType(e.target.value as any)}
                      className="w-full text-xs bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none text-[#2E2E2E]"
                    >
                      <option value="System Design">System Design</option>
                      <option value="Algorithms">Algorithms</option>
                      <option value="Behavioral">Behavioral (STAR)</option>
                      <option value="Frontend">Frontend Core</option>
                      <option value="DB / SQL">DB & Query Systems</option>
                    </select>

                    <select
                      value={intStatus}
                      onChange={(e) => setIntStatus(e.target.value as any)}
                      className="w-full text-xs bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none text-[#2E2E2E]"
                    >
                      <option value="Review Required">Review Required 🔴</option>
                      <option value="Familiar">Familiar 🟡</option>
                      <option value="Mastered">Mastered 🟢</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Implementation code structures, notes or analysis parameters..."
                    value={intNotes}
                    onChange={(e) => setIntNotes(e.target.value)}
                    className="w-full text-xs bg-[#FFF8E7]/40 border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowIntForm(false)} className="px-3 py-1.5 text-[#7A6F62]">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-[#6F4E37] text-white font-bold rounded-xl">Map Concept</button>
                  </div>
                </form>
              )}

              {/* Prep decks display */}
              {interviewPreps.length === 0 ? (
                <div className="text-center py-10 bg-white/50 border border-dashed border-[#6F4E37]/15 rounded-3xl text-xs text-[#7A6F62]">
                  No tracked algorithm topics mapped. Add above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interviewPreps.map(prep => (
                    <div key={prep.id} className="bg-white p-4 rounded-3xl border border-[#6F4E37]/10 shadow-sm space-y-3 group relative">
                      <button
                        onClick={() => deletePrep(prep.id)}
                        className="absolute top-4 right-4 text-[#7A6F62] hover:text-[#EF4444]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] uppercase font-bold text-[#D4A017] px-2 py-0.5 rounded-md bg-[#6F4E37]/5 border border-[#6F4E37]/10">
                          {prep.type}
                        </span>
                        
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          prep.status === "Review Required"
                            ? "bg-[#EF4444]/15 text-[#EF4444]"
                            : prep.status === "Familiar"
                            ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                            : "bg-[#4CAF50]/15 text-[#4CAF50]"
                        }`}>
                          {prep.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#6F4E37]">{prep.topic}</h4>
                      {prep.notes && (
                        <p className="text-[11px] text-[#7A6F62] bg-[#FFF8E7]/30 p-2 rounded-xl border border-[#6F4E37]/5 leading-relaxed font-semibold">
                          {prep.notes}
                        </p>
                      )}

                      {/* Mastery selector buttons */}
                      <div className="flex items-center justify-between border-t border-[#6F4E37]/5 pt-3">
                        <span className="text-[9px] font-mono text-[#7A6F62]">Recalibrate Confidence Tracker:</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => updatePrepStatus(prep.id, "Review Required")}
                            className="px-2 py-0.5 rounded text-[8px] uppercase font-bold text-[#EF4444] bg-[#EF4444]/5 hover:bg-[#EF4444]/10"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => updatePrepStatus(prep.id, "Familiar")}
                            className="px-2 py-0.5 rounded text-[8px] uppercase font-bold text-[#F59E0B] bg-[#F59E0B]/5 hover:bg-[#F59E0B]/10"
                          >
                            Familiar
                          </button>
                          <button
                            onClick={() => updatePrepStatus(prep.id, "Mastered")}
                            className="px-2 py-0.5 rounded text-[8px] uppercase font-bold text-[#4CAF50] bg-[#4CAF50]/5 hover:bg-[#4CAF50]/10"
                          >
                            Optimal
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
