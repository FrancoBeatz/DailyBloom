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
  Plus,
  Trash2,
  Calendar,
  Cpu,
  Bookmark,
  Coffee,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { AnimatedCheckbox } from "@/components/motion/AnimatedCheckbox";
import { ShimmerText, MagneticButton } from "@/components/motion/MagneticButton";
import { audioService } from "@/lib/AudioService";

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
    learningTopics,
    updateDeveloperHours,
    updateTask,
    deleteProject,
    addProject,
    addTask,
    addLearningTopic,
    updateLearningHours,
    deleteLearningTopic,
  } = useProductivity();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "learning" | "jobs">("overview");

  // Persisted state for Job Applications
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
    try {
      const val = localStorage.getItem("creamflow_matrix_jobs");
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("creamflow_matrix_jobs", JSON.stringify(jobApplications));
  }, [jobApplications]);

  // Hours logging form
  const [addCodingHours, setAddCodingHours] = useState(1);
  const [addLearningHours, setAddLearningHours] = useState(1);

  // Project form states
  const [showProjForm, setShowProjForm] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projOverview, setProjOverview] = useState("");
  const [projTargetDate, setProjTargetDate] = useState("");
  const [projMilestones, setProjMilestones] = useState("");

  // Job form states
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobCompany, setJobCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobNotes, setJobNotes] = useState("");

  // Learning form states
  const [showLearnForm, setShowLearnForm] = useState(false);
  const [learnTitle, setLearnTitle] = useState("");
  const [learnDesc, setLearnDesc] = useState("");
  const [learnTargetHours, setLearnTargetHours] = useState(10);

  const handleHourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeveloperHours(Number(addCodingHours), Number(addLearningHours));
    audioService.playSuccessChime();
    setAddCodingHours(1);
    setAddLearningHours(1);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const ms = projMilestones
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean);

    await addProject({
      name: projTitle.trim(),
      description: projOverview.trim() || undefined,
      deadline: projTargetDate || undefined,
      milestones: ms.length > 0 ? ms : undefined,
    });

    audioService.playSuccessChime();
    toast.success(`Project "${projTitle}" registered`);
    setProjTitle("");
    setProjOverview("");
    setProjTargetDate("");
    setProjMilestones("");
    setShowProjForm(false);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobCompany.trim() || !jobRole.trim()) return;
    const newJob: JobApplication = {
      id: `job-${Date.now()}`,
      company: jobCompany.trim(),
      role: jobRole.trim(),
      stage: "Applied",
      salary: jobSalary.trim() || "Competitive",
      notes: jobNotes.trim(),
    };
    setJobApplications((prev) => [newJob, ...prev]);
    audioService.playSuccessChime();
    toast.success(`Application for ${jobCompany} saved`);
    setJobCompany("");
    setJobRole("");
    setJobSalary("");
    setJobNotes("");
    setShowJobForm(false);
  };

  const handleCreateLearning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnTitle.trim()) return;

    await addLearningTopic({
      title: learnTitle.trim(),
      description: learnDesc.trim() || "Active Study Module",
      target_hours: Number(learnTargetHours) || 10,
    });

    audioService.playSuccessChime();
    toast.success(`Topic "${learnTitle}" added`);
    setLearnTitle("");
    setLearnDesc("");
    setShowLearnForm(false);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017]">
            ENGINEERING & CAREER MATRIX
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#6F4E37] tracking-tight flex items-center gap-2">
            Developer Matrix ☕
          </h1>
          <p className="text-xs text-[#7A6F62]">
            Monitor technical development hours, skill mastery paths, portfolio projects, and career targets.
          </p>
        </div>

        {/* Fluid Tab Selector */}
        <div className="flex p-1 bg-white rounded-2xl border border-[#6F4E37]/15 shadow-xs relative">
          {[
            { id: "overview", label: "Overview", icon: Cpu },
            { id: "projects", label: "Projects", icon: Layers },
            { id: "learning", label: "Study Topics", icon: BookOpen },
            { id: "jobs", label: "Job Tracker", icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  isActive ? "text-white" : "text-[#7A6F62] hover:text-[#6F4E37]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="matrixTab"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-[#6F4E37] rounded-xl -z-10 shadow-xs"
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. OVERVIEW & METRICS BENTO GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <SpotlightCard tiltEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">
              Coding Hours
            </span>
            <div className="p-2 rounded-xl bg-[#6F4E37]/10 text-[#6F4E37]">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-[#6F4E37]">
              <AnimatedNumber
                value={developerMetrics?.coding_hours || 0}
                format={(n) => n.toFixed(1)}
              />
            </span>
            <span className="text-xs text-[#7A6F62] font-semibold">hrs logged</span>
          </div>
        </SpotlightCard>

        <SpotlightCard tiltEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">
              Learning Hours
            </span>
            <div className="p-2 rounded-xl bg-[#6F4E37]/10 text-[#6F4E37]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-[#6F4E37]">
              <AnimatedNumber
                value={developerMetrics?.learning_hours || 0}
                format={(n) => n.toFixed(1)}
              />
            </span>
            <span className="text-xs text-[#7A6F62] font-semibold">hrs study</span>
          </div>
        </SpotlightCard>

        <SpotlightCard tiltEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">
              Active Projects
            </span>
            <div className="p-2 rounded-xl bg-[#6F4E37]/10 text-[#6F4E37]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-[#6F4E37]">
              <AnimatedNumber value={projects.length} />
            </span>
            <span className="text-xs text-[#7A6F62] font-semibold">in sprint</span>
          </div>
        </SpotlightCard>

        <SpotlightCard tiltEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">
              Applications
            </span>
            <div className="p-2 rounded-xl bg-[#6F4E37]/10 text-[#6F4E37]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-[#6F4E37]">
              <AnimatedNumber value={jobApplications.length} />
            </span>
            <span className="text-xs text-[#7A6F62] font-semibold">pipelines</span>
          </div>
        </SpotlightCard>
      </div>

      {/* 2. TAB VIEWS */}
      {/* Tab: Overview (Hour Logger + Summary) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Hours Logger */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/15 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-serif font-bold text-[#6F4E37] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4A017]" />
                <span>Log Developer Hours</span>
              </h2>
              <p className="text-xs text-[#7A6F62]">
                Record manual coding and study sessions to keep your career trajectory accurate.
              </p>
            </div>

            <form onSubmit={handleHourSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
                  Coding / Development (+{addCodingHours}h)
                </label>
                <input
                  type="number"
                  min={0.25}
                  step={0.25}
                  value={addCodingHours}
                  onChange={(e) => setAddCodingHours(Number(e.target.value))}
                  className="w-full mt-1.5 p-2.5 text-xs font-semibold bg-[#FFF8E7]/40 border border-[#6F4E37]/20 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
                  Study / Learning (+{addLearningHours}h)
                </label>
                <input
                  type="number"
                  min={0.25}
                  step={0.25}
                  value={addLearningHours}
                  onChange={(e) => setAddLearningHours(Number(e.target.value))}
                  className="w-full mt-1.5 p-2.5 text-xs font-semibold bg-[#FFF8E7]/40 border border-[#6F4E37]/20 rounded-xl focus:outline-none"
                />
              </div>

              <MagneticButton
                type="submit"
                className="w-full py-3 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-xs font-serif font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Log Developer Sprint ☕
              </MagneticButton>
            </form>
          </div>

          {/* Project & Learning Highlights */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#6F4E37]">
                  Active Engineering Sprints
                </h3>
                <span className="text-xs text-[#6F4E37] font-semibold font-mono">
                  {projects.length} Total
                </span>
              </div>

              <div className="space-y-3">
                {projects.map((proj) => {
                  const projTasks = tasks.filter((t) => t.project_id === proj.id);
                  const completed = projTasks.filter((t) => t.status === "Complete").length;
                  const pct =
                    projTasks.length > 0 ? Math.round((completed / projTasks.length) * 100) : 0;

                  return (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl bg-[#FFF8E7]/30 border border-[#6F4E37]/10 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#6F4E37]">{proj.name}</h4>
                        {proj.description && (
                          <p className="text-[11px] text-[#7A6F62] truncate mt-0.5">
                            {proj.description}
                          </p>
                        )}
                        <p className="text-[10px] text-[#7A6F62] mt-1">
                          {completed}/{projTasks.length} tasks finished
                        </p>
                      </div>

                      <div className="w-24 text-right flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-[#6F4E37]">{pct}%</span>
                        <div className="w-full bg-[#6F4E37]/10 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-[#6F4E37] h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Projects Detail */}
      {activeTab === "projects" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/15 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#6F4E37]">Project Trackers</h2>
              <p className="text-xs text-[#7A6F62]">Manage key project deliverables & milestones</p>
            </div>
            <button
              onClick={() => setShowProjForm(!showProjForm)}
              className="px-4 py-2 bg-[#6F4E37] text-white rounded-xl text-xs font-bold hover:bg-[#5a3e2b] transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>

          <AnimatePresence>
            {showProjForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateProject}
                className="p-5 bg-[#FFF8E7]/50 rounded-2xl border border-[#6F4E37]/20 space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Project Name..."
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Overview / Goal of project..."
                  value={projOverview}
                  onChange={(e) => setProjOverview(e.target.value)}
                  className="w-full p-2.5 text-xs font-medium bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none resize-none"
                />
                <textarea
                  rows={2}
                  placeholder="Milestones (one per line)..."
                  value={projMilestones}
                  onChange={(e) => setProjMilestones(e.target.value)}
                  className="w-full p-2.5 text-xs font-medium bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProjForm(false)}
                    className="px-3 py-1.5 text-xs text-[#7A6F62] hover:text-[#6F4E37]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#6F4E37] text-white text-xs font-bold rounded-xl"
                  >
                    Save Project
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-[#FFF8E7]/30 border border-[#6F4E37]/15 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#6F4E37]">{proj.name}</h3>
                  <button
                    onClick={() => deleteProject(proj.id)}
                    className="text-[#7A6F62] hover:text-red-500 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {proj.description && (
                  <p className="text-xs text-[#7A6F62]">{proj.description}</p>
                )}

                {proj.milestones && proj.milestones.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#6F4E37]/10">
                    <span className="text-[10px] uppercase font-bold text-[#6F4E37]">
                      Milestones
                    </span>
                    {proj.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#2E2E2E]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Study / Learning Topics */}
      {activeTab === "learning" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/15 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#6F4E37]">Learning Modules</h2>
              <p className="text-xs text-[#7A6F62]">
                Structure tech study paths and track logged hours vs targets
              </p>
            </div>
            <button
              onClick={() => setShowLearnForm(!showLearnForm)}
              className="px-4 py-2 bg-[#6F4E37] text-white rounded-xl text-xs font-bold hover:bg-[#5a3e2b] transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          </div>

          <AnimatePresence>
            {showLearnForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateLearning}
                className="p-5 bg-[#FFF8E7]/50 rounded-2xl border border-[#6F4E37]/20 space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Skill / Topic Title (e.g., Rust Concurrency, GraphQL Systems)..."
                  value={learnTitle}
                  onChange={(e) => setLearnTitle(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Target Hours (e.g., 20)..."
                  value={learnTargetHours}
                  onChange={(e) => setLearnTargetHours(Number(e.target.value))}
                  className="w-full p-2.5 text-xs font-semibold bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLearnForm(false)}
                    className="px-3 py-1.5 text-xs text-[#7A6F62]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#6F4E37] text-white text-xs font-bold rounded-xl"
                  >
                    Save Topic
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningTopics.map((lt) => {
              const pct = Math.min(100, Math.round((lt.logged_hours / lt.target_hours) * 100));

              return (
                <div
                  key={lt.id}
                  className="p-5 rounded-2xl bg-[#FFF8E7]/30 border border-[#6F4E37]/15 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#6F4E37]">{lt.title}</h3>
                    <button
                      onClick={() => deleteLearningTopic(lt.id)}
                      className="text-[#7A6F62] hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7A6F62]">
                    <span>
                      {lt.logged_hours} / {lt.target_hours} Hours
                    </span>
                    <span className="font-mono font-bold text-[#6F4E37]">{pct}%</span>
                  </div>

                  <div className="w-full bg-[#6F4E37]/10 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="bg-[#6F4E37] h-full rounded-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#6F4E37]/10">
                    <button
                      onClick={() => updateLearningHours(lt.id, 1)}
                      className="px-3 py-1 bg-white border border-[#6F4E37]/20 rounded-xl text-xs font-bold text-[#6F4E37] hover:bg-[#FFF8E7] transition cursor-pointer"
                    >
                      +1h Study
                    </button>
                    <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider ml-auto">
                      {lt.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Job Applications */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/15 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#6F4E37]">Career Opportunities</h2>
              <p className="text-xs text-[#7A6F62]">
                Track interview stages, companies, and offer negotiations
              </p>
            </div>
            <button
              onClick={() => setShowJobForm(!showJobForm)}
              className="px-4 py-2 bg-[#6F4E37] text-white rounded-xl text-xs font-bold hover:bg-[#5a3e2b] transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Company</span>
            </button>
          </div>

          <AnimatePresence>
            {showJobForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateJob}
                className="p-5 bg-[#FFF8E7]/50 rounded-2xl border border-[#6F4E37]/20 space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Company Name..."
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    className="p-2.5 text-xs font-semibold bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Role (e.g., Senior Frontend Architect)..."
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="p-2.5 text-xs font-semibold bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="px-3 py-1.5 text-xs text-[#7A6F62]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#6F4E37] text-white text-xs font-bold rounded-xl"
                  >
                    Save Pipeline
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {jobApplications.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7A6F62]">
                No career pipelines logged yet. Click &ldquo;Add Company&rdquo; to begin.
              </div>
            ) : (
              jobApplications.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-2xl bg-[#FFF8E7]/30 border border-[#6F4E37]/15 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#6F4E37]">{job.company}</h4>
                    <p className="text-[11px] text-[#7A6F62]">{job.role}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#6F4E37]/10 text-[#6F4E37]">
                      {job.stage}
                    </span>
                    <button
                      onClick={() =>
                        setJobApplications((prev) => prev.filter((j) => j.id !== job.id))
                      }
                      className="text-[#7A6F62] hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
